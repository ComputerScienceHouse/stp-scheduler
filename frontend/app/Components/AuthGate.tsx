/**
 * File: stp-scheduler/frontend/app/Components/AuthGate.tsx
 * Author: ---
 * Created: i need to check :(
 * Last Updated: 06/26/2026
 * 
 * Editors:
 *  
 * Summary: confirms login
 */
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { API_URL, getToken } from "../apiClient";

export default function AuthGate({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const r = await fetch(`${API_URL}/auth/status`);
        const j = (await r.json()) as { auth_required?: boolean };
        if (!j.auth_required) {
          if (!cancelled) setReady(true);
          return;
        }
        if (pathname === "/login") {
          if (!cancelled) setReady(true);
          return;
        }
        if (!getToken()) {
          window.location.replace("/login");
          return;
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready) {
    return (
      <div className="p-8 text-center text-black">Loading…</div>
    );
  }

  return <>{children}</>;
}
