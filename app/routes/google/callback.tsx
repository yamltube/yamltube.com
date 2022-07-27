import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getGoogleAccessToken } from "~/models/google.server";
import type { OauthAccessToken } from "~/utils";
import { setGoogleAccessToken } from "~/utils";

type LoaderData = {
  token: OauthAccessToken;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let accessToken;
  if (!code) {
    throw new Response("No code sent", { status: 400 });
  }
  if (code) {
    accessToken = await getGoogleAccessToken(
      code,
      "http://localhost:3000/google/callback"
    );
    if ("error" in accessToken) {
      console.log(`Error: ${JSON.stringify(accessToken)}`);
      throw new Response("Failed to create access token", { status: 500 });
    }
    if (!accessToken) {
      throw new Response("Internal Server Error.", { status: 500 });
    }
    return json({ token: accessToken });
  } else {
    throw new Response("Missing scope or code", { status: 400 });
  }
};

// http://localhost:3000/google/callback?code=4/0AX4XfWhu_QLTa7lUTAIeftU9ytWxRAwZ_eGUEKgQM89KYpcgISxBiejZNkS-3nfRJGo37A&scope=https://www.googleapis.com/auth/youtube
export default function () {
  const data = useLoaderData() as LoaderData;
  useEffect(() => {
    setGoogleAccessToken(data.token);
    window.location.href = "/";
  }, [data]);

  return <></>;
}
