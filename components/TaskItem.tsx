"use client";
// This component needs to remember whether it's in "editing" mode and react
// to button clicks, so it has to run in the browser (a Server Component
// can't do either of those things).

import { useState } from "react";
import { updateTask, deleteTask } from "../app/actions";

type Task = {
  id: string;
  name: string;
  description: string | null;
  dueDate: Date;
  category: string | null;
};

export default function TaskItem({ task }: { task: Task }) {
  // Local, per-task state: is this specific card showing the edit form
  // right now? Each TaskItem has its own independent copy of this.
  const [editing, setEditing] = useState(false);

  if (editing) {
    // --- Edit mode: a form pre-filled with the task's current values ---
    return (
      <li className="border rounded-lg p-4 shadow-sm">
        <form
          action={async (formData) => {
            // Even though this is a client component, we can still call
            // the server action directly and await its result.
            await updateTask(task.id, formData);
            setEditing(false); // flip back to display mode once saved
          }}
          className="space-y-3"
        >
          <input type="text" name="name" defaultValue={task.name} required className="w-full border rounded px-3 py-2" />
          <textarea name="description" defaultValue={task.description ?? ""} className="w-full border rounded px-3 py-2" />
          <input type="text" name="category" defaultValue={task.category ?? ""} placeholder="Category (optional)" className="w-full border rounded px-3 py-2" />
          <input type="date" name="dueDate" defaultValue={task.dueDate.toISOString().slice(0, 10)} required className="w-full border rounded px-3 py-2" />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="bg-red-600 px-4 py-2 rounded hover:bg-red-400">
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  // --- Display mode: just show the task's info and action links ---
  return (
    <li className="border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{task.name}</h2>
        {task.category && (
          <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full">
            {task.category}
          </span>
        )}
      </div>
      {task.description && <p className="text-gray-600 mt-1">{task.description}</p>}
      <p className="text-sm text-gray-500 mt-2">Due: {task.dueDate.toLocaleDateString()}</p>
      <div className="flex gap-4 mt-3">
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline">
          Edit
        </button>
        <button
          onClick={() => {
            // Native browser confirmation dialog - helps prevent
            // an accidental click permanently deleting a task.
            if (confirm(`Delete "${task.name}"?`)) {
              deleteTask(task.id);
            }
          }}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </li>
  );
}