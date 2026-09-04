"use server";

import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession } from "../lib/auth";
import { redirect } from "next/navigation";

// Creates a brand-new user account, logs them in immediately, and sends
// them to the homepage.
export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Simplest possible error handling for now - a real app would surface
    // this message back to the form instead of silently failing.
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  await createSession(user.id);
  redirect("/");
}

// Verifies credentials and logs an existing user in.
export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return;

  await createSession(user.id);
  redirect("/");
}

// Logs the current user out and sends them back to the login page.
export async function logout() {
  await destroySession();
  redirect("/login");
}