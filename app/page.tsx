import { prisma } from "../lib/prisma";
import { createTask } from "./actions";
import { logout } from "./auth-actions";
import { getCurrentUser } from "../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TaskItem from "../components/TaskItem";
import { getUniqueCategories } from "../lib/task-utils";

// This is a Server Component (no "use client"), so it runs on the server,
// queries the database directly, and ships pre-rendered HTML to the browser.
export default async function Home({
  searchParams,
}: {
  // Next.js 16 made searchParams a Promise you have to await - it's not a
  // plain object anymore like in older versions.
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  // Gate the whole page behind login - if there's no valid session,
  // bounce straight to the login page before touching any task data.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const categoryFilter = params.category;
  const sortOrder = params.sort === "desc" ? "desc" : "asc";

  // The filter and sort state both live in the URL (?category=Work&sort=desc)
  // instead of React state - that means no client-side JS is needed for
  // filtering/sorting to work, and the filtered view is bookmarkable/shareable.
  // On top of that, every query below is scoped to `userId: user.id` - that's
  // the whole mechanism that keeps one user's tasks private from everyone else.
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    orderBy: { dueDate: sortOrder },
  });

  // Build the list of distinct categories in use, to render as filter links.
  const allTasks = await prisma.task.findMany({
    where: { userId: user.id },
    select: { category: true },
  });
  const categories = getUniqueCategories(allTasks.map((t) => t.category));

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="text-blue-600 hover:underline">
              Log out
            </button>
          </form>
        </div>
      </div>

      <form action={createTask} className="border rounded-lg p-4 mb-8 space-y-3">
        <input type="text" name="name" placeholder="Task name" required className="w-full border rounded px-3 py-2" />
        <textarea name="description" placeholder="Description (optional)" className="w-full border rounded px-3 py-2" />
        <input type="text" name="category" placeholder="Category (optional)" className="w-full border rounded px-3 py-2" />
        <input type="date" name="dueDate" required className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Task
        </button>
      </form>

      {/* Filter/sort bar - plain links that change the URL, which re-runs
          this Server Component with new searchParams. No React state at all. */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <span className="text-gray-400">Filter:</span>
        <Link href="/" className={!categoryFilter ? "font-bold underline" : "text-blue-600"}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}${sortOrder === "desc" ? "&sort=desc" : ""}`}
            className={categoryFilter === c ? "font-bold underline" : "text-blue-600"}
          >
            {c}
          </Link>
        ))}
        <span className="text-gray-600">|</span>
        <Link
          href={`/?sort=${sortOrder === "asc" ? "desc" : "asc"}${categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : ""}`}
          className="text-blue-600"
        >
          Due date: {sortOrder === "asc" ? "Earliest first ↑" : "Latest first ↓"}
        </Link>
      </div>

      <ul className="space-y-4">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500">No tasks yet. Add one to get started!</p>
        )}
      </ul>
    </main>
  );
}