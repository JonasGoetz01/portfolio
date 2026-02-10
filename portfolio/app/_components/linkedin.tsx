"use client";

import LinkedinIcon from "@/components/ui/linkedin-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const linkedinRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-2 items-center"
              onMouseEnter={() => linkedinRef.current?.startAnimation()}
              onMouseLeave={() => linkedinRef.current?.stopAnimation()}
            >
              <LinkedinIcon ref={linkedinRef} />
              <Link href="https://www.linkedin.com/in/jonasgoetz01/">JonasGoetz01</Link>
            </div>
    );
}