import { getGithubOAuthUrl, githubClientId } from "~/utils";

export type GithubAccessToken = {
  access_token: string;
  scope: string;
  token_type: string;
};

export async function getGithubAccessToken(code: string) {
  console.log(process.env.GITHUB_CLIENT_SECRET);
  const data = new FormData()
  data.append("client_id", githubClientId)
  data.append("client_secret", process.env.GITHUB_CLIENT_SECRET as string)
  data.append("code", code)
  data.append("redirect_uri", "http://localhost:3000/github/callback")

  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: data,
    headers: {
      Accept: "application/json",
    },
  });
  const body = await resp.text();
  console.log(body);
  try {
    return JSON.parse(body) as GithubAccessToken;
  } catch (e) {
    return { error: body };
  }
}
