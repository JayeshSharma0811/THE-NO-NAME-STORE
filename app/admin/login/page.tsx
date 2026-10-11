
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const responseText = await response.text();

let result: { error?: string; success?: boolean };

try {
  result = responseText
    ? JSON.parse(responseText)
    : {};
} catch {
  throw new Error(
    `Login API returned invalid JSON (HTTP ${response.status}). Check the terminal for server errors.`
  );
}

if (!response.ok) {
  throw new Error(
    result.error || `Login failed (HTTP ${response.status}).`
  );
}

      if (!response.ok) {
        throw new Error(result.error || "Login failed.");
      }

      // Keep this only for compatibility with an existing
      // client-side AdminGuard, if it uses this key.
      sessionStorage.setItem("no-name-admin-auth", "true");

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 text-[#111]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            NO NAME
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-black/50">
            Sign in to manage your store.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
        >
          <label className="mb-2 block text-sm font-medium">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            required
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:opacity-60"
          />

          <label className="mb-2 mt-5 block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:opacity-60"
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-black/40">
          Admin access only
        </p>
      </div>
    </main>
  );
}