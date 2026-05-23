"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_URL, apiFetch, setToken } from "../apiClient";

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((x) => JSON.stringify(x)).join("; ");
  return "Login failed";
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const r = await fetch(`${API_URL}/auth/status`);
        const j = (await r.json()) as { auth_required?: boolean };
        if (!cancelled && j.auth_required === false) {
          window.location.href = "/";
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const r = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      skipAuthRedirect: true,
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(formatDetail((body as { detail?: unknown }).detail));
      return;
    }
    const token = (body as { access_token?: string }).access_token;
    if (!token) {
      setError("No token returned");
      return;
    }
    setToken(token);
    window.location.href = "/";
  }

  if (checking) {
    return (
      <p className="p-8 text-center text-black">Loading…</p>
    );
  }

  return (
    <main className="max-w-lg mx-auto my-[13.25vh] px-16 py-16 border-2 border-black rounded-4xl">
      <h1 className="text-xl font-semibold mb-4 text-black">Sign in</h1>
      {/* <p className="text-sm text-neutral-700 mb-4">
        Use the username and password matching AUTH_USERNAME and AUTH_PASSWORD on
        the API server.
      </p> */}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-black text-sm">
          Username
          <input
            className="border rounded px-2 py-1 text-black"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-black text-sm">
          Password
          <input
            type="password"
            className="border rounded px-2 py-1 text-black"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="text-red-700 text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="bg-neutral-800 text-white rounded py-2 px-3 hover:bg-neutral-700"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
