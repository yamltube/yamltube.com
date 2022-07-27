import { useMemo } from "react";
import { useMatches } from "@remix-run/react";
import type { User } from "./models/user.server";
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

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

// Thank you stacky https://stackoverflow.com/a/24103596/18094166
export function setCookie(name: string, value: string, days: number) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name: string) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function eraseCookie(name: string) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export const githubClientId = "5223206b50553304aa91";
export const githubScope = "repo";
export const GithubStorageKey = "github_access_token";

export function getGithubOAuthUrl() {
  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", githubClientId);
  // url.searchParams.set("client_secret", "76196214f67f18532ea4c356f3dea395d9eaa50f")
  url.searchParams.set("redirect_uri", "http://localhost:3000/github/callback");
  url.searchParams.set("scope", githubScope);
  url.searchParams.set("state", "big ole nuggets and shit");
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

export const googleClientId =
  "950442956992-h8s172bdvuclvekmrqf8ltr64jnkh2k5.apps.googleusercontent.com";

// https://developers.google.com/youtube/v3/guides/auth/installed-apps
export const googleScope = "https://www.googleapis.com/auth/youtube";

const GoogleStorageKey = "google_key";

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
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", "http://localhost:3000/google/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("scope", googleScope);

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
  googleToken: OauthAccessToken,
  pulumiToken: string
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
    "https://api.github.com/repos/mchaynes/yamltube/generate",
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
    "PULUMI_ACCESS_TOKEN",
    pulumiToken,
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
