import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

export const COOKIE_NAME = "wedding_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminCredentials(email: string, password: string) {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}

export function createSessionToken(email: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      expiresAt?: number;
    };

    return parsed.email === process.env.ADMIN_EMAIL && Number(parsed.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(response: Response, token: string) {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: "/"
  });
}

export function clearAdminSessionCookie(response: Response) {
  response.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function isAdminRequest(request: Request) {
  return verifySessionToken(request.cookies?.[COOKIE_NAME]);
}

export function requireAdmin(request: Request, response: Response) {
  if (!isAdminRequest(request)) {
    response.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}
