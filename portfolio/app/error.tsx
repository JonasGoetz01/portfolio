"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Client-only by definition, and deliberately quiet
 * about the cause — the digest is enough to find the real error in the logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="animate-rise-fast pt-[72px]">
      <span className="mb-[10px] block font-mono text-[11px] tracking-[0.05em] text-brand">
        ERROR
      </span>
      <h1 className="mb-[10px] text-[40px] font-semibold leading-tight tracking-[-0.03em]">
        That did not work
      </h1>
      <p className="mb-9 max-w-[52ch] text-base leading-relaxed text-dim">
        Something broke while rendering this page. Trying again is usually enough.
      </p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-md bg-brand px-5 py-[11px] font-mono text-[12.5px] tracking-[0.03em] text-bg transition-opacity hover:opacity-85"
      >
        TRY AGAIN
      </button>
      {error.digest && (
        <p className="mt-7 font-mono text-[11px] text-dim">Digest: {error.digest}</p>
      )}
    </section>
  );
}
