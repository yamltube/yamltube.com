function determineBaseUrl() {
  console.log(typeof window);
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    console.log(JSON.stringify(url));
    return `${url.protocol}//${url.host}`;
  }
  return "http://localhost:3000";
}

const baseUrl = determineBaseUrl();

export function getConfig() {
 console.log(`baseUrl: ${baseUrl}`);
  console.log(JSON.stringify(config[baseUrl]));
  return config[baseUrl];
}

type Config = {
  google: {
    redirectUri: string;
    clientId: string;
    scope: string;
    authorizeUri: string;
  };

  github: {
    oauthUri: string;
    clientId: string;
    scope: string;
    callbackUri: string;
    accessTokenUri: string;
  };
};

export const config: { [key: string]: Config } = {
  "https://yamltube.com": {
    google: {
      redirectUri: `${baseUrl}/google/callback`,
      clientId:
        "950442956992-efiotr5gl9msjmbifc0ijt8pie7n9h2h.apps.googleusercontent.com",

      // https://developers.google.com/youtube/v3/guides/auth/installed-apps
      scope: "https://www.googleapis.com/auth/youtube",
      authorizeUri: "https://accounts.google.com/o/oauth2/v2/auth",
    },
    github: {
      oauthUri: "https://github.com/login/oauth/authorize",
      clientId: "5223206b50553304aa91",
      scope: "repo",
      callbackUri: `${baseUrl}/github/callback`,
      accessTokenUri: "https://github.com/login/oauth/access_token",
    },
  },
  "http://localhost:3000": {
    google: {
      redirectUri: `${baseUrl}/google/callback`,
      clientId:
        "950442956992-efiotr5gl9msjmbifc0ijt8pie7n9h2h.apps.googleusercontent.com",

      // https://developers.google.com/youtube/v3/guides/auth/installed-apps
      scope: "https://www.googleapis.com/auth/youtube",
      authorizeUri: "https://accounts.google.com/o/oauth2/v2/auth",
    },
    github: {
      oauthUri: "https://github.com/login/oauth/authorize",
      clientId: "60dabc11fe05438beb0a",
      scope: "repo",
      callbackUri: `${baseUrl}/github/callback`,
      accessTokenUri: "https://github.com/login/oauth/access_token",
    },
  },
};
