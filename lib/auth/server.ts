// import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("NEON_AUTH_BASE_URL is not configured.");
}

if (!cookieSecret) {
  throw new Error("NEON_AUTH_COOKIE_SECRET is not configured.");
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});

export async function getCurrentUser() {
  const { data: session } = await auth.getSession();

  return session?.user ?? null;
}

export function isAdminUser(user: unknown): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }

  const role = (user as { role?: unknown }).role;

  if (Array.isArray(role)) {
    return role.includes("admin");
  }

  return role === "admin";
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (!isAdminUser(user)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
