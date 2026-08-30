/**
 * File: stp-scheduler/frontend/app/Cruds/createStudent.tsx
 * Author: ---
 * Created: i need to check :(
 * Last Updated: 06/26/2026
 * 
 * Editors: Addison A (ShadowArcher289)
 *  
 * Summary: the Signout button. Also checks if auth is required.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, getToken, setToken } from "../apiClient";
import NavItem from "./Navitem";

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
    <div className="flex flex-row justify-center items-center underline w-44 p-1 text-center border-2 rounded ">
      {loggedIn ? (
        <button
          type="button"
          onClick={signOut}
          className="underline ml-1 p-2 pl-4 pr-4 bg-transparent border-0 cursor-pointer text-inherit font-inherit"
        >
          Sign out
        </button>
      ) : (
        <NavItem title="Sign in" route="/login" ></NavItem>
      )}
    </div>
  );
}
