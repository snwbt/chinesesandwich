"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/guest/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/welcome");
    } else {
      setError("Incorrect password. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-serif text-stone-700 mb-2">Our Wedding</h1>
        <p className="text-stone-500 mb-8 text-sm tracking-wide uppercase">
          Enter the site password to continue
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            aria-label="Site password"
            className="w-full border border-stone-300 rounded px-4 py-2 text-center text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {error && (
            <p role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded px-4 py-2 transition-colors"
          >
            {loading ? "Entering…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
