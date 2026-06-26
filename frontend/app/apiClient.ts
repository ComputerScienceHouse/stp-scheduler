/**
 * File: stp-scheduler/frontend/app/apiClient.ts
 * Author: ---
 * Created: i need to check :(
 * Last Updated: 06/26/2026
 * 
 * Editors:
 *  
 * Summary: Helper function for fetching from the backend
 */

import "dotenv/config";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const TOKEN_KEY = "stp_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export type ApiFetchOptions = RequestInit & { skipAuthRedirect?: boolean };

export async function apiFetch(
  path: string,
  init: ApiFetchOptions = {},
): Promise<Response> {
  const { skipAuthRedirect, ...rest } = init;
  const url = path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(rest.headers ?? undefined);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...rest, headers });
  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !skipAuthRedirect &&
    !window.location.pathname.startsWith("/login")
  ) {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.assign("/login");
  }
  return res;
}
