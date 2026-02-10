"use client";

import GithubIcon from "@/components/ui/github-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const githubRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-2 items-center"
              onMouseEnter={() => githubRef.current?.startAnimation()}
              onMouseLeave={() => githubRef.current?.stopAnimation()}
            >
              <GithubIcon ref={githubRef} />
              <Link href="https://github.com/jonasgoetz01">JonasGoetz01</Link>
            </div>
    );
}