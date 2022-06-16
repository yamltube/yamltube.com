import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getGithubAccessToken } from "~/models/github.server";
import type { OauthAccessToken} from "~/utils";
import { setGithubCode } from "~/utils";

type LoaderData = {
  token: OauthAccessToken;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const code = new URL(request.url).searchParams.get("code");
  let accessToken;
  if (!code) {
    throw new Response("No code sent", { status: 400 });
  }
  if (code) {
    accessToken = await getGithubAccessToken(code);
    if (!accessToken) {
      throw new Response("Good lord", { status: 500 });
    }
  }

  return json({ accessToken });
};

export default function () {
  const data = useLoaderData() as LoaderData;
  useEffect(() => {
    if (data) {
      setGithubCode(data.token);
    }
    redirect("/");
  }, [data]);

  return <></>;
}
