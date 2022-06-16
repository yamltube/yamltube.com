import { useEffect } from "react";
import { setGoogleAccessToken } from "~/utils";

export default function () {
    useEffect(() => {
        const url = new URL(window.location.href);
        setGoogleAccessToken({
          access_token: url.searchParams.get("access_token") ?? "",
          token_type: url.searchParams.get("token_type") ?? "",
          expires_in: url.searchParams.get("expires_in") ?? "",
          scope: url.searchParams.get("scope") ?? "",
        });
        window.location.href = "/"
    }, [])

  return <></>;
}
