import { login } from "../auth-actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="max-w-sm mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>
      <form action={login} className="space-y-3">
        <input type="email" name="email" placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <input type="password" name="password" placeholder="Password" required className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Log In
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Need an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}