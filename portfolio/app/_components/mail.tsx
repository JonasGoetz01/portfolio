"use client";

import MailFilledIcon from "@/components/ui/mail-filled-icon";
import { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useRef } from "react";

export default function Github() {
    const mailRef = useRef<AnimatedIconHandle>(null);
    return (
        <div
              className="flex gap-2 items-center"
              onMouseEnter={() => mailRef.current?.startAnimation()}
              onMouseLeave={() => mailRef.current?.stopAnimation()}
            >
              <MailFilledIcon ref={mailRef} />
              <Link href="mailto:jonas@goetz.sh">jonas@goetz.sh</Link>
            </div>
    );
}