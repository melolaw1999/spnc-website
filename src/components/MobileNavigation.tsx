"use client";

import type { ReactNode } from "react";

export function MobileNavigation({ children }: { children: ReactNode }) {
  return <details className="mobile-nav" onClick={(event) => {
    if (event.target instanceof Element && event.target.closest("a[href]")) {
      event.currentTarget.open = false;
    }
  }}>{children}</details>;
}
