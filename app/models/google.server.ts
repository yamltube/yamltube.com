import type { OauthAccessToken } from "~/utils";
import { getConfig } from "~/config";

/**
 * Gets an OAuth2 token from Google.
 * https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#exchange-authorization-code
 */
export async function getGoogleAccessToken(code: string, redirectUri: string) {
  const jsondata = {
    client_id: getConfig().google.clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    code: code,
    grant_type: "authorization_code",
  };

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: JSON.stringify(jsondata),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const body = await resp.text();
  try {
    return JSON.parse(body) as OauthAccessToken;
  } catch (e) {
    return { error: body };
  }
}
