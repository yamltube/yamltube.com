import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  "950442956992-fgaibggqjg1pahrg61v9b76k3e7av5cf.apps.googleusercontent.com";

hydrate(<GoogleOAuthProvider clientId={clientId}><RemixBrowser /></GoogleOAuthProvider>, document);
