import type { OauthAccessToken } from "~/utils";
import { githubClientId } from "~/utils";

export async function getGithubAccessToken(
  code: string,
  clientId?: string,
  clientSecret?: string
) {
  const data = new FormData();
  data.append("client_id", clientId || githubClientId);
  data.append(
    "client_secret",
    clientSecret || (process.env.GITHUB_CLIENT_SECRET as string)
  );
  data.append("code", code);
  data.append("redirect_uri", "http://localhost:3000/github/callback");

  const resp = await fetch("https://github.com/login/oauth/access_token", {
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
