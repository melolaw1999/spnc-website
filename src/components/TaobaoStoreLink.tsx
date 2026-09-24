"use client";

import { type ReactNode, type MouseEvent, useEffect, useRef } from "react";
import { openTaobaoWithFallback, shouldOpenTaobaoApp } from "@/lib/taobao-navigation";

export function TaobaoStoreLink({ href, className, children }: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const cancelPending = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelPending.current?.(), []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
      || event.shiftKey || event.altKey
      || !shouldOpenTaobaoApp(navigator.userAgent, navigator.maxTouchPoints)) return;
    event.preventDefault();
    cancelPending.current?.();
    cancelPending.current = openTaobaoWithFallback(href);
  };

  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>{children}</a>;
}
