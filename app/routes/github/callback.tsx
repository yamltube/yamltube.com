import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getGithubAccessToken } from "~/models/github.server";
import type { OauthAccessToken } from "~/utils";
import { setGithubCode } from "~/utils";

type LoaderData = {
  accessToken: OauthAccessToken;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  console.log("Server or Client: " + typeof document === "undefined");
  const code = new URL(request.url).searchParams.get("code");
  let accessToken;
  if (!code) {
    throw new Response("No code sent", { status: 400 });
  }
  if (code) {
    accessToken = await getGithubAccessToken(code);
    if ("error" in accessToken) {
      throw new Response("Failed to create access token", { status: 500 });
    }
    if (!accessToken) {
      throw new Response("Internal Server Error.", { status: 500 });
    }
    return { accessToken: accessToken } as LoaderData;
  }

  return json({ accessToken });
};

export default function () {
  const data = useLoaderData() as LoaderData;
  useEffect(() => {
    if (data) {
      setGithubCode(data.accessToken);
    }
    window.location.href = "/";
  }, [data]);

  return <></>;
}
