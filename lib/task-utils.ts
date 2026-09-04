// Small, pure, easily-testable helper functions used by the task actions
// and the homepage. Keeping this logic here (instead of inline in a Server
// Action) is what makes it possible to unit test with Vitest - Server
// Actions rely on Next.js-only APIs (cookies, redirect) that don't work
// in a plain test environment, but plain functions like these do.

// A task needs at least a name and a due date to be valid.
export function isValidTaskInput(name: string, dueDate: string): boolean {
  return Boolean(name && name.trim().length > 0 && dueDate && dueDate.trim().length > 0);
}

// Converts a date-only string (e.g. "2026-09-03" from a <input type="date">)
// into a Date object anchored to LOCAL midnight, rather than UTC midnight.
// Without this, dates can appear to shift a day earlier or later depending
// on the user's time zone.
export function parseDueDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

// Given a list of tasks' category values (which may be null), returns the
// unique, non-empty category names - used to build the filter links.
export function getUniqueCategories(categories: (string | null)[]): string[] {
  return Array.from(new Set(categories.filter((c): c is string => Boolean(c))));
}