import { signup } from "../auth-actions";
import Link from "next/link";

// A simple signup form. Submitting it runs the `signup` Server Action,
// which creates the account, logs the user in, and redirects to "/".
export default function SignupPage() {
  return (
    <main className="max-w-sm mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      <form action={signup} className="space-y-3">
        <input type="email" name="email" placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <input type="password" name="password" placeholder="Password" required minLength={8} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}