import type { OauthAccessToken } from "~/utils";
import { getConfig } from "~/config";

export async function getGithubAccessToken(code: string) {
  const data = new FormData();
  data.append("client_id", getConfig().github.clientId);
  data.append("client_secret", process.env.GITHUB_CLIENT_SECRET as string);
  data.append("code", code);
  data.append("redirect_uri", getConfig().github.callbackUri);

  const resp = await fetch(getConfig().github.accessTokenUri, {
    method: "POST",
    body: data,
    headers: {
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
