import { nanoid } from "nanoid";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "cookbook_sid";

export function getSessionId(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function setSessionCookie(res: NextResponse, id: string) {
  res.cookies.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export function newSessionId(): string {
  return nanoid();
}
