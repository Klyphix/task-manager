"use server";
// Everything exported from this file runs on the server only, never in the
// browser. That's what lets us safely query the database directly here.

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../lib/auth";
import { isValidTaskInput, parseDueDate } from "../lib/task-utils";

// Creates a new task from the "Add Task" form submission.
export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return; // not logged in - nothing to do

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const category = formData.get("category") as string;

  if (!isValidTaskInput(name, dueDate)) return;

  await prisma.task.create({
    data: {
      name,
      description: description || null,
      dueDate: parseDueDate(dueDate),
      category: category || null,
      userId: user.id, // ties this task to whoever is logged in
    },
  });

  revalidatePath("/");
}

// Updates an existing task. `id` is passed in separately from the form data
// (bound in TaskItem via the inline function) so we know which row to touch.
export async function updateTask(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const category = formData.get("category") as string;

  if (!isValidTaskInput(name, dueDate)) return;
  
  // updateMany (rather than update) lets us filter by userId too, so this
  // silently does nothing if someone tries to edit a task that isn't theirs.
  await prisma.task.updateMany({
    where: { id, userId: user.id },
    data: {
      name,
      description: description || null,
      dueDate: parseDueDate(dueDate),
      category: category || null,
    },
  });

  revalidatePath("/");
}

// Deletes a task by id, but only if it actually belongs to the logged-in user.
export async function deleteTask(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.task.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
}