/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useEffect, useState } from "react";
import { LogoSvg as GoogleSvg  } from "./google";
import { GithubSvg } from "./github";
import { OauthAccessToken, getGithubOAuthUrl, getGoogleAccessToken, getGoogleOAuthUrl, getGithubAccessToken } from "~/utils";



const Missing = {
  Everything: <>Turn the ❌ into ✅ by clicking the buttons</>,
  Google: (
    <>
      <div className="pl-1">{GoogleSvg()}</div>
      Almost There
      <div className="pl-1">{GoogleSvg()}</div>
    </>
  ),
  Github: (
    <>
      <div className="pl-1">{GithubSvg()}</div>
      Almost There
      <div className="pl-1">{GithubSvg()}</div>
    </>
  ),
  Nothing: <>Enjoy your day!</>,
};

export default function Index() {
  const [githubData, setGitHubData] = useState<OauthAccessToken|undefined>();
  const [googleData, setGoogleData] = useState<OauthAccessToken|undefined>();
  const [missing, setMissing] = useState<keyof typeof Missing>();

  useEffect(() => {
    const token = getGoogleAccessToken()
    if (token) {
      setGoogleData(token)
    }
  }, [])

  useEffect(() => {
    const token = getGithubAccessToken()
    if (token) {
      setGitHubData(token)
    }
  }, [])

  useEffect(() => {
    if (githubData && googleData) {
      setMissing("Nothing");
    }
    if (!githubData && googleData) {
      setMissing("Github");
    }
    if (githubData && !googleData) {
      setMissing("Google");
    }
    if (!githubData && !googleData) {
      setMissing("Everything");
    }
  }, [githubData, googleData]);

  function C(str: string) {
    return (
      <div className="text-black-400 flex items-center justify-center rounded-md border border-transparent pb-3 text-base font-medium">
        {str}
      </div>
    );
  }
  const buttonCss =
    "text-black-400 flex items-center justify-center rounded-md border border-transparent bg-gray-200 px-4 py-3 text-base font-medium shadow-sm hover:bg-green-50 sm:px-8";
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
            <span className="block uppercase text-red-500 drop-shadow-md">
              YamlTube
            </span>
          </h1>
          <div className="mx-auto mt-10 flex max-w-sm max-w-none justify-center pb-3">
            <div className="inline-grid grid-cols-2 gap-5 space-y-4 space-y-0 sm:mx-auto">
              <a href={getGithubOAuthUrl()}>
                <button className={buttonCss}>
                  {GithubSvg()}
                  GitHub
                </button>
              </a>
              <a href={getGoogleOAuthUrl()}>
                <button className={buttonCss}>
                  {GoogleSvg()}
                  Google
                </button>
              </a>
              {githubData ? C("✅") : C("❌")}
              {googleData ? C("✅") : C("❌")}
            </div>
          </div>
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="/pretty.jpg"
                alt="The Main Event"
              />
              <div className="bg-[color:rgba(255, 0, 0, 0.8)] absolute inset-0 mix-blend-multiply" />
            </div>
            <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-8">
              <div className="mx-auto mt-6 mb-20 flex max-w-lg items-center justify-center text-center text-xl text-white sm:max-w-3xl">
                {Missing[missing || "Everything"]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
