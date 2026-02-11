"use client";

import MailFilledIcon from "@/components/ui/mail-filled-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const mailRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-1.5 sm:gap-2 items-center min-w-0"
              onMouseEnter={() => mailRef.current?.startAnimation()}
              onMouseLeave={() => mailRef.current?.stopAnimation()}
            >
              <MailFilledIcon ref={mailRef} className="flex-shrink-0" />
              <Link href="mailto:jonas@goetz.sh" className="text-base sm:text-sm font-medium truncate min-w-0">jonas@goetz.sh</Link>
            </div>
    );
}