import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signInAction, signOutAction } from "../actions";
import { BUTTON, HINT, LABEL } from "../_components/fields";
import { currentSession } from "@/lib/admin/auth";
import { adminConfig, ENV_KEYS } from "@/lib/admin/config";

export const metadata: Metadata = {
  title: "Sign in — Admin",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered. Without this the build — which has no admin environment and
 * no cookies — bakes in the redirect to the sign-in page, and a configured
 * deployment would serve that instead of ever reading the session.
 */
export const dynamic = "force-dynamic";

/** Why a sign-in did not finish, in plain words. */
const PROBLEMS: Record<string, string> = {
  denied: "The sign-in was cancelled on GitHub's side.",
  state:
    "That sign-in could not be matched to this browser. It may have been left open too long — start again.",
  exchange: "GitHub would not exchange the code for a token. Check the OAuth app's client secret.",
  github: "GitHub could not be reached. Try again in a moment.",
  forbidden: `That GitHub account is not on the ${ENV_KEYS.logins} list.`,
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  const config = adminConfig();
  const { problem } = await searchParams;

  if (config.ok && (await currentSession())) redirect("/admin");

  return (
    <section className="animate-rise-fast pt-[72px]">
      <p className={`${LABEL} mb-2`}>Admin</p>
      <h1 className="mb-[10px] text-[clamp(30px,8vw,40px)] font-semibold leading-tight tracking-[-0.03em]">
        Sign in
      </h1>

      {!config.ok ? (
        <Setup missing={config.missing} />
      ) : (
        <>
          <p className="mb-9 max-w-[52ch] text-base leading-relaxed text-dim">
            Writing here commits to the repository as you, so it needs your GitHub account. Only the
            accounts on the allowlist can get in.
          </p>

          {problem && PROBLEMS[problem] && (
            <p
              role="alert"
              className="mb-7 rounded-md border border-brand bg-surface p-4 text-[14px]"
            >
              {PROBLEMS[problem]}
            </p>
          )}

          <form action={signInAction}>
            <button type="submit" className={BUTTON}>
              Continue with GitHub
            </button>
          </form>

          <form action={signOutAction} className="mt-11">
            <button type="submit" className="font-mono text-[12px] text-dim underline">
              Clear the session cookie
            </button>
          </form>
        </>
      )}
    </section>
  );
}

/** What is still missing, for a deployment where the admin was never set up. */
function Setup({ missing }: { missing: readonly string[] }) {
  return (
    <>
      <p className="mb-7 max-w-[56ch] text-base leading-relaxed text-dim">
        The admin is not configured on this deployment, so there is nothing to sign in to. It needs
        a GitHub OAuth app and these variables in the environment:
      </p>
      <ul className="mb-7 flex list-none flex-col gap-2 font-mono text-[13px]">
        {Object.values(ENV_KEYS).map((key) => (
          <li key={key} className="flex items-center gap-3">
            <span
              aria-hidden
              className={`size-[6px] rounded-sm ${missing.includes(key) ? "bg-brand" : "bg-line"}`}
            />
            <span className={missing.includes(key) ? "text-ink" : "text-dim"}>{key}</span>
            <span className={HINT}>{missing.includes(key) ? "missing" : "set"}</span>
          </li>
        ))}
      </ul>
      <p className={`max-w-[56ch] ${HINT}`}>
        The repository README has the setup, including the callback URL to register and why the
        secret has to be at least 32 characters.
      </p>
    </>
  );
}
