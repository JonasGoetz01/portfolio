"use client";

import LinkedinIcon from "@/components/ui/linkedin-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const linkedinRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-1.5 sm:gap-2 items-center min-w-0"
              onMouseEnter={() => linkedinRef.current?.startAnimation()}
              onMouseLeave={() => linkedinRef.current?.stopAnimation()}
            >
              <LinkedinIcon ref={linkedinRef} className="flex-shrink-0" />
              <Link href="https://www.linkedin.com/in/jonasgoetz01/" className="text-base sm:text-sm font-medium truncate min-w-0">JonasGoetz01</Link>
            </div>
    );
}