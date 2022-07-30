function determineBaseUrl() {
  try {
    if (!window) {
      console.log("window not defined");
      return "https://yamltube.com";
    }
    const url = new URL(window.location.href);

    return `${url.protocol}://${url.hostname}:${url.port}`;
  } catch (e) {
    return "https://yamltube.com";
  }
}

const baseUrl = determineBaseUrl();

export const config = {
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
  yamltube: {},
};
