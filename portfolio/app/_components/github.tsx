"use client";

import GithubIcon from "@/components/ui/github-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const githubRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-1.5 sm:gap-2 items-center min-w-0"
              onMouseEnter={() => githubRef.current?.startAnimation()}
              onMouseLeave={() => githubRef.current?.stopAnimation()}
            >
              <GithubIcon ref={githubRef} className="flex-shrink-0" />
              <Link href="https://github.com/jonasgoetz01" className="text-base sm:text-sm font-medium truncate min-w-0">JonasGoetz01</Link>
            </div>
    );
}