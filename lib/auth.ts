import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE = "session_token";
const SESSION_LENGTH_DAYS = 7;

// Hashes a plain-text password before it ever touches the database.
// We NEVER store the actual password anywhere - only this one-way hash.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Compares a plain-text password attempt against the stored hash.
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Creates a new session for a user: a random token stored in the database,
// with a copy of that same token handed to the browser as an httpOnly
// cookie (meaning client-side JavaScript can't read or steal it).
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_LENGTH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    expires: expiresAt,
    path: "/",
  });
}

// Looks at the incoming request's cookie, finds the matching session in the
// database, and returns the logged-in user - or null if nobody's logged in
// (or their session expired).
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

// Logs the current user out: deletes their session from the database and
// clears the cookie in the browser.
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}