"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, getToken, setToken } from "../apiClient";

export default function NavbarAuthControls() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authRequired, setAuthRequired] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`${API_URL}/auth/status`);
        const j = (await r.json()) as { auth_required?: boolean };
        if (!cancelled) {
          setAuthRequired(j.auth_required === true);
          setLoggedIn(!!getToken());
        }
      } catch {
        if (!cancelled) setAuthRequired(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function signOut() {
    setToken(null);
    window.location.href = "/login";
  }

  if (authRequired !== true) {
    return null;
  }

  return (
    <li className="flex flex-row justify-center items-center list-none">
      {loggedIn ? (
        <button
          type="button"
          onClick={signOut}
          className="underline ml-1 bg-transparent border-0 cursor-pointer text-inherit font-inherit"
        >
          Sign out
        </button>
      ) : (
        <Link href="/login" className="underline ml-1">
          Sign in
        </Link>
      )}
    </li>
  );
}
