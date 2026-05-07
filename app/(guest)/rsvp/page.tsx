"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RSVPLookupPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/rsvp/lookup?code=${encodeURIComponent(code.trim().toUpperCase())}`);

    if (res.ok) {
      const data = await res.json();
      router.push(`/rsvp/${data.partyId}`);
    } else if (res.status === 404) {
      setError("Invite code not found. Please check and try again.");
    } else {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto py-16 text-center">
      <h1 className="text-3xl font-serif text-stone-700 mb-2">RSVP</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Enter the invite code from your invitation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="INVITE CODE"
          required
          aria-label="Invite code"
          className="w-full border border-stone-300 rounded px-4 py-2 text-center uppercase tracking-widest text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded px-4 py-2 transition-colors"
        >
          {loading ? "Looking up…" : "Find My Invitation"}
        </button>
      </form>
    </div>
  );
}
