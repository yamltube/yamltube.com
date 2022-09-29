import { useMemo } from "react";
import { useMatches } from "@remix-run/react";
import type { User } from "./models/user.server";
import { getConfig } from "./config";
import * as sodium from "libsodium-wrappers";
import * as nacl from "js-nacl";
import * as base64 from "base64-js";

export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

export function isUser(user: User) {
  return user && typeof user === "object";
}

export function useOptionalUser() {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export const GithubStorageKey = "github_access_token";

export function getGithubOAuthUrl() {
  const url = new URL(getConfig().github.oauthUri);

  url.searchParams.set("client_id", getConfig().github.clientId);
  url.searchParams.set("redirect_uri", getConfig().github.callbackUri);
  url.searchParams.set("scope", getConfig().github.scope);
  url.searchParams.set("state", "stateeeee");
  return url.toString();
}

export function setGithubCode(accessToken: OauthAccessToken) {
  localStorage.setItem(GithubStorageKey, JSON.stringify(accessToken));
}

export function getGithubAccessToken() {
  const item = localStorage.getItem(GithubStorageKey);
  if (item) {
    try {
      return JSON.parse(item) as OauthAccessToken;
    } catch (e) {
      return "";
    }
  }
  return "";
}

export const GoogleStorageKey = "google_key";

export type OauthAccessToken = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  scope: string;
  expires_in: string;
};

export function isValidPulumiToken(token: string): boolean {
  return token?.startsWith("pul-");
}

export function isValidGoogleToken(token?: OauthAccessToken): boolean {
  if (
    token?.access_token &&
    token?.scope &&
    token?.token_type &&
    token?.refresh_token
  ) {
    return true;
  }
  return false;
}

export function isValidGithubToken(token?: OauthAccessToken): boolean {
  if (token?.access_token && token?.scope && token?.token_type) {
    return true;
  }
  return false;
}

export function getGoogleOAuthUrl(): string {
  const url = new URL(getConfig().google.authorizeUri);

  url.searchParams.set("client_id", getConfig().google.clientId);
  url.searchParams.set("redirect_uri", getConfig().google.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("scope", getConfig().google.scope);

  return url.toString();
}

export function setGoogleAccessToken(token: OauthAccessToken) {
  localStorage.setItem(GoogleStorageKey, JSON.stringify(token));
}

export function getGoogleAccessToken() {
  const token = localStorage.getItem(GoogleStorageKey);
  if (token) {
    return JSON.parse(token) as OauthAccessToken;
  }
  return null;
}

export type GithubRepo = {
  id: string;
  name: string;
  full_name?: string;
  private?: boolean;
  description?: string;
  action?: string;
  owner?: {
    login?: string;
    avatar_url?: string;
  };
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
};

export async function getGithubRepos(token: string) {
  const resp = await fetch("https:/api.github.com/user/repos", {
    headers: {
      Authorization: "bearer " + token,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (resp.status !== 200) {
    throw new Error("failed: " + (await resp.text()));
  }
  return (await resp.json()) as GithubRepo[];
}

export function getObsfuscatedCopy<T extends Record<string, any>>(
  obj: T,
  ...clearKeys: (keyof T)[]
): Record<string, string> {
  return obj
    ? Object.entries(obj)
        .map(([k, v]) => [k, clearKeys.includes(k) ? v : "xxx"])
        .reduce((newObj, [k, v]) => ({ [k]: v, ...newObj }), {})
    : obj;
}

export async function createOrUpdateRepo(
  fullName: string,
  githubToken: OauthAccessToken,
  googleToken: OauthAccessToken
) {
  if (!fullName.includes("/")) {
    throw new Error("Gotta contain a /");
  }
  const owner = fullName.split("/")[0];
  const repo = fullName.split("/")[1];

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `token ${githubToken.access_token}`,
  };
  let resp = await fetch(
    "https://api.github.com/repos/yamltube/yamltube/generate",
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        name: repo,
        owner: owner,
        private: true,
      }),
    }
  );

  if (resp.status > 399 && resp.status !== 422) {
    throw new Error(await resp.text());
  }

  resp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`,
    {
      headers: headers,
    }
  );

  if (resp.status > 399) {
    throw new Error(await resp.text());
  }

  const { key, key_id } = (await resp.json()) as {
    key: string;
    key_id: string;
  };

  await createSecret(
    owner,
    repo,
    key,
    key_id,
    "GOOGLE_APPLICATION_CREDENTIALS",
    JSON.stringify(googleToken),
    headers
  );
  await createSecret(
    owner,
    repo,
    key,
    key_id,
    "STACK_NAME",
    `${owner}-${repo}`,
    headers
  );
}

export async function createSecret(
  owner: string,
  repo: string,
  key: string,
  keyId: string,
  name: string,
  value: string,
  headers: HeadersInit
) {
  const promise = new Promise<nacl.Nacl>((resolve, reject) => {
    nacl.instantiate((v) => {
      resolve(v);
    });
  });
  const naclInstance = await promise.then();
  await sodium.ready;
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(value);
  const keyBytes = base64.toByteArray(key);

  // Encrypt using LibSodium.
  // @ts-ignore
  const encryptedBytes = naclInstance.crypto_box_seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encrypted = base64.fromByteArray(encryptedBytes);

  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${name}`,
    {
      headers: headers,
      method: "PUT",
      body: JSON.stringify({
        encrypted_value: encrypted,
        key_id: keyId,
      }),
    }
  );
}
