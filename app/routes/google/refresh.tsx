import type { LoaderFunction } from "@remix-run/node";
import { getConfig } from "~/config";

export const loader: LoaderFunction = async ({ request }) => {
  const refresh_token = new URL(request.url).searchParams.get("refresh_token");
  const jsondata = {
    client_id: getConfig().google.clientId,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refresh_token,
    grant_type: "refresh_token",
  };
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: JSON.stringify(jsondata),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return new Response(JSON.stringify(await resp.json()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
