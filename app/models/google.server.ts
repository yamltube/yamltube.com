import type { OauthAccessToken } from "~/utils";
import { config } from "~/config";

/**
 * Gets an OAuth2 token from Google.
 * https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#exchange-authorization-code
 */
export async function getGoogleAccessToken(code: string, redirectUri: string) {
  const jsondata = {
    client_id: config.google.clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    code: code,
    grant_type: "authorization_code",
  };
  const data = new FormData();
  data.append("client_id", config.google.clientId);
  data.append("client_secret", process.env.GOOGLE_CLIENT_SECRET as string);
  data.append("code", code);
  data.append("redirect_uri", redirectUri);

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
