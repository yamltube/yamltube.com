import { useMemo } from "react";
import { useMatches } from "@remix-run/react";
import type { User } from "./models/user.server";

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
    return JSON.parse(item) as OauthAccessToken;
  }
  return "";
}

const googleClientId =
  "950442956992-fgaibggqjg1pahrg61v9b76k3e7av5cf.apps.googleusercontent.com";

// https://developers.google.com/youtube/v3/guides/auth/installed-apps
const googleScope = "https://www.googleapis.com/auth/youtube";

const GoogleStorageKey = "google_key";

export type OauthAccessToken = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: string;
};

export function getGoogleOAuthUrl(): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", "http://localhost:3000/google/callback");
  url.searchParams.set("response_type", "token");
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
