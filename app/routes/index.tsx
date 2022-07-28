/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useEffect, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";

import { LogoSvg as GoogleSvg, YoutubeSvg } from "./google";
import { GithubSvg } from "./github";
import {
  OauthAccessToken,
  getGithubOAuthUrl,
  getGoogleAccessToken,
  getGoogleOAuthUrl,
  getGithubAccessToken,
  GithubRepo,
  getGithubRepos,
  isValidGoogleToken,
  isValidGithubToken,
  isValidPulumiToken,
  createOrUpdateRepo,
  GoogleStorageKey,
  GithubStorageKey,
  PulumiStorageKey,
} from "~/utils";
import { PulumiSvg } from "./pulumi/svg";

const Step = {
  Start: <>you gotta turn the ❌ into ✅</>,
  MissingGoogle: (
    <>
      <div className="inline-block pl-1">{GoogleSvg()}</div>
      almost there
      <div className="inline-block pl-1">{GoogleSvg()}</div>
    </>
  ),
  GithubPulumi: (
    <>
      <div className="inline-block pl-1">{GithubSvg()}</div>
      almost there
      <div className="inline-block pl-1">{GithubSvg()}</div>
    </>
  ),
  MissingPulumi: (
    <>
      <div className="inline-block pl-1"></div>
    </>
  ),
  Done: <>enjoy your day!</>,
};

function isValidRepo(repo: string) {
  return /.+\/.+/.test(repo);
}

export default function Index() {
  const [pulumiToken, setPulumiToken] = useState<string>("");
  const [githubData, setGitHubData] = useState<OauthAccessToken | undefined>();
  const [googleData, setGoogleData] = useState<OauthAccessToken | undefined>();
  const [repo, setRepo] = useState("");
  const [goClicked, setGoClicked] = useState(false);
  const [missing, setMissing] = useState<ReadonlyArray<JSX.Element>>([]);

  function message(missing: ReadonlyArray<JSX.Element>) {
    if (missing.length === 0) {
      if (!repo) {
        return <>you gotta enter a repo name</>;
      }
      if (!isValidRepo(repo)) {
        return <>include the owner, like mchaynes/yamltube</>;
      }
      if (!goClicked) {
        return (
          <>
            click <span className="font-bold">go</span>!
          </>
        );
      }
      return <>enjoy your day!</>;
    }
    if (missing.length === 3) {
      return <>you gotta turn the ❌ into ✅</>;
    }
    let left = missing[0];
    let right = missing[0];
    if (missing.length > 1) {
      right = missing[1];
    }
    return (
      <div className="flex flex-row items-center justify-center">
        <div className="mr-3 w-8">{left}</div>
        almost there
        <div className="ml-3 w-8">{right}</div>
      </div>
    );
  }

  useEffect(() => {
    const token = getGoogleAccessToken();
    if (token) {
      setGoogleData(token);
    }
  }, []);

  useEffect(() => {
    const token = getGithubAccessToken();
    if (token) {
      setGitHubData(token);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(PulumiStorageKey);
    if (token) {
      setPulumiToken(token);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PulumiStorageKey, pulumiToken);
  }, [pulumiToken]);

  useEffect(() => {
    let missing = [];
    if (!isValidGithubToken(githubData)) {
      missing.push(GithubSvg());
    }
    if (!isValidGoogleToken(googleData)) {
      missing.push(YoutubeSvg());
    }
    if (!isValidPulumiToken(pulumiToken)) {
      missing.push(PulumiSvg());
    }
    setMissing(missing);
  }, [githubData, googleData, pulumiToken]);

  async function onClick() {
    if (githubData && googleData && isValidRepo(repo)) {
      await createOrUpdateRepo(repo, githubData, googleData, pulumiToken);
      setGoClicked(true);
      window.open(`https://github.com/${repo}`);
    }
  }

  function deleteGoogleData() {
    localStorage.removeItem(GoogleStorageKey);
    setGoogleData(undefined);
  }

  function deleteGitHubData() {
    localStorage.removeItem(GithubStorageKey);
    setGitHubData(undefined);
  }

  function deletePulumiData() {
    localStorage.removeItem(PulumiStorageKey);
    setPulumiToken("");
  }

  const buttonCss =
    "text-black-400 mb-2 w-32 flex flex-col hover:bg-gray-300 items-center rounded-md border border-transparent bg-gray-200 px-4 py-3 shadow-sm ";
  return (
    <main>
      <div className="flex flex-col flex-wrap items-center">
        {/* HEADER */}
        <div className="flex w-full flex-col items-center border-b-2 border-gray-200 p-2 px-3 text-center font-extrabold">
          <h1 className="text-6xl text-red-500 drop-shadow-md sm:text-8xl lg:text-7xl">
            yamltube
          </h1>
          <div className="mt-2" />
          <h4 className="text-center text-base font-extrabold tracking-tight text-gray-600 sm:text-xl lg:text-2xl">
            create youtube playlists on github
          </h4>
          <div className="mt-4" />
          <iframe
            src="https://ghbtns.com/github-btn.html?user=mchaynes&repo=yamltube&type=star&count=true"
            frameBorder="0"
            scrolling="0"
            width="150"
            height="20"
            title="GitHub"
          ></iframe>
        </div>
        {/* BODY */}
        <div className="mb-4"></div>

        <p className="mx-2 max-w-lg text-center font-extrabold text-gray-600">
          set up yamltube on github with only a couple clicks.
        </p>
        <div className="mt-2" />
        <p className="mx-2 max-w-lg text-center font-semibold text-gray-600">
          i never use the access you grant to the site. after you click{" "}
          <span className="font-extrabold text-green-500">go</span>, only your
          github repo has access to your accounts.
        </p>
        <div className="mt-6" />
        <div className="flex flex-col flex-wrap items-center rounded-xl border-2">
          <div className="mt-2 flex flex-row items-stretch gap-11 p-2">
            <div className="flex flex-col items-center">
              <a href={getGithubOAuthUrl()}>
                <button className={buttonCss}>
                  <div className="flex flex-row items-center">
                    {GithubSvg()}
                    github
                  </div>
                </button>
              </a>
              <div className="text-base font-medium">
                <Check
                  goodToGo={isValidGithubToken(githubData)}
                  onConfirm={deleteGitHubData}
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <a href={getGoogleOAuthUrl()}>
                <button className={buttonCss}>
                  <div className="flex flex-row items-center">
                    <div className="mr-1 w-6">{YoutubeSvg()}</div>
                    youtube
                  </div>
                </button>
              </a>
              <div className="text-base font-medium">
                <Check
                  goodToGo={isValidGoogleToken(googleData)}
                  onConfirm={deleteGoogleData}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center">
            <h5 className="ml-2 mb-1 self-start pl-2">
              enter your{" "}
              <a
                className="text-blue-600 underline"
                href="https://app.pulumi.com"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://app.pulumi.com");
                }}
              >
                pulumi access token
              </a>
              :
            </h5>
            <div className="ml-4 flex flex-row items-center justify-items-stretch self-start border-0">
              <div className="form-input mr-3 flex h-10 min-h-fit flex-grow flex-row items-center rounded-md border-0 p-0 text-sm">
                <div className="h-8 w-8">{PulumiSvg()}</div>
                <input
                  type="password"
                  placeholder="pul-somereallylongstring"
                  className="border-1 h-full w-52 flex-grow rounded-md p-0 pl-2 text-sm"
                  value={pulumiToken}
                  onChange={(e) => setPulumiToken(e.target.value)}
                />
              </div>

              <Check
                goodToGo={isValidPulumiToken(pulumiToken)}
                onConfirm={deletePulumiData}
              />
            </div>
            <div className="m-2 mt-8 flex flex-col items-center border-t-2 border-gray-500 bg-slate-100 p-8 pt-2 pb-2">
              <div className="flex min-w-full self-start border-b-2 border-gray-500 p-1 pl-4 pb-2">
                github repo
              </div>
              <div className="mb-1 w-full " />
              <div className="flex flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="mchaynes/yamltube"
                  className="form-input rounded-md text-sm"
                  onChange={(e) => setRepo(e.target.value)}
                />
                <button
                  disabled={
                    !googleData ||
                    !githubData ||
                    !isValidPulumiToken(pulumiToken) ||
                    !isValidRepo(repo)
                  }
                  className={
                    "rounded-md border border-transparent bg-green-500 px-4 py-1 font-bold text-white shadow-sm hover:bg-green-800 disabled:bg-red-500"
                  }
                  onClick={onClick}
                >
                  go
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4" />
        <div className="flex max-w-md flex-col items-center sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
          <div className="relative w-96 shadow-sm">
            <div className="absolute inset-0 rounded-lg">
              <img
                width="3840"
                height="2160"
                className="rounded-2xl object-contain"
                src="/pretty.jpg"
                alt="The Main Event"
              />
            </div>
            <div className="relative mb-20 px-4 pt-16 text-center text-xl text-white">
              {message(missing)}
            </div>
          </div>
        </div>
        <div className="mt-1 mb-8" />

        {FAQ()}
      </div>
    </main>
  );
}

type CheckProps = {
  goodToGo: boolean;
  onConfirm: () => void;
};

function Check({ goodToGo, onConfirm }: CheckProps) {
  const [clicked, setClicked] = useState(false);

  function onClick() {
    if (clicked) {
      onConfirm();
    }
    if (goodToGo) {
      setClicked(true);
      // reset clicked status after 3 seconds
      setTimeout(() => setClicked(false), 3000);
    }
  }

  let val = "❌";

  if (goodToGo) {
    val = "✅";
  }

  if (goodToGo && clicked) {
    val = "🗑";
  }

  return (
    <div className={goodToGo ? "cursor-pointer" : ""} onClick={onClick}>
      {val}
    </div>
  );
}

export function FAQ() {
  return (
    <div className="flex w-96 max-w-md flex-col items-center rounded-2xl bg-white px-4 pb-48">
      <Accordian
        titleContents={
          <span>
            what does clicking <span className="font-bold">go</span> do?
          </span>
        }
      >
        <p>
          you'll get a brand new github repo with all the secrets necessary to
          run yamltube fully in github actions.{" "}
        </p>
        <p>
          more specifically, your browser will use the github credentials you
          granted to yamltube to go create a github repo based on the
          `mchaynes/yamltube` template repo.
        </p>
      </Accordian>
      <Accordian
        titleContents={<span>where is the token stored exactly?</span>}
      >
        <p>
          github repo {"=>"} settings {"=>"} secrets {"=>"} actions
        </p>
      </Accordian>
      <Accordian
        titleContents={
          <span>why do you need access to my youtube account?</span>
        }
      >
        <p>
          yamltube needs a google token to interact with youtube. when you log
          in to google, the website receives a token we save to github actions.
          to get that token at all, you need an oauth2 application set up with
          google. you can set this site up manually if you want
        </p>
      </Accordian>
      <Accordian titleContents={<span>what exactly does this site do?</span>}>
        it configures a fork of yamltube so that yamltube's github action just
        works™️. i set up github and google oauth apps so that you don't have to
        set up oauth if you want to use yamltube. it just makes set up easier. i
        love interactive setup!
      </Accordian>
      <Accordian
        titleContents={<span>why do i need to use your oauth app?</span>}
      >
        you don't need to. it's just easier if you do. you can run this site
        yourself with your own google and github oauth apps to generate your
        access tokens.
      </Accordian>
      <Accordian titleContents={<span>are you going to steal my data?</span>}>
        no. but i could! don't trust random websites with your data!
      </Accordian>
      <Accordian
        titleContents={<span>does this site store any credentials?</span>}
      >
        <>
          nope! only client-side in localstorage. go read the{" "}
          <a
            href="https://github.com/mchaynes/yamltube.com"
            className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
          >
            code
          </a>
          . there is a network call to a netlify function to get access tokens
          to github and google after the oauth flow. i can't do this client side
          because the calls need my client_secret for each oauth app, and i
          can't safely give that out.
        </>
      </Accordian>
    </div>
  );
}

type AccordianProps = {
  titleContents: JSX.Element;
  children: string | JSX.Element | JSX.Element[];
};
function Accordian({ titleContents, children }: AccordianProps) {
  return (
    <Disclosure as="div" className="mt-2">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-96 justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium text-black hover:bg-gray-200">
            {titleContents}
            <ChevronUpIcon
              className={`${
                open ? "rotate-180 transform" : ""
              } h-5 w-5 text-black`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
