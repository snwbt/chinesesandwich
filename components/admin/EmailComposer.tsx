"use client";

import { useState } from "react";
import type { EmailType } from "@/lib/email";

interface GuestOption {
  id: string;
  name: string;
  email: string | null;
  party: { name: string };
}

interface SendResult {
  email: string;
  ok: boolean;
  error?: string;
}

export default function EmailComposer({ guests }: { guests: GuestOption[] }) {
  const [recipientMode, setRecipientMode] = useState<"all" | "select" | "custom">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customEmails, setCustomEmails] = useState("");
  const [type, setType] = useState<EmailType>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);

  function toggleGuest(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function resolveRecipients(): string[] {
    if (recipientMode === "all") {
      return guests.map((g) => g.email!).filter(Boolean);
    }
    if (recipientMode === "select") {
      return guests
        .filter((g) => selectedIds.has(g.id) && g.email)
        .map((g) => g.email!);
    }
    return customEmails
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const to = resolveRecipients();
    if (to.length === 0) return;

    setSending(true);
    setResults(null);

    const res = await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html: body, type }),
    });

    const data = await res.json();
    setResults(data.results ?? []);
    setSending(false);
  }

  const recipients = resolveRecipients();

  return (
    <form onSubmit={handleSend} className="space-y-6">
      {/* Recipient mode */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Recipients</label>
        <div className="flex gap-3 mb-3">
          {(["all", "select", "custom"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRecipientMode(mode)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                recipientMode === mode
                  ? "bg-primary-500 text-white border-primary-500"
                  : "border-stone-300 text-stone-600 hover:border-primary-400"
              }`}
            >
              {mode === "all" ? `All guests (${guests.length})` : mode === "select" ? "Select guests" : "Custom emails"}
            </button>
          ))}
        </div>

        {recipientMode === "select" && (
          <div className="border border-stone-200 rounded-lg max-h-48 overflow-y-auto">
            {guests.map((g) => (
              <label key={g.id} className="flex items-center gap-3 px-4 py-2 hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(g.id)}
                  onChange={() => toggleGuest(g.id)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">{g.name}</span>
                <span className="text-xs text-stone-400">{g.email}</span>
              </label>
            ))}
          </div>
        )}

        {recipientMode === "custom" && (
          <textarea
            value={customEmails}
            onChange={(e) => setCustomEmails(e.target.value)}
            placeholder="Enter emails separated by commas or new lines"
            rows={3}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        )}

        {recipients.length > 0 && (
          <p className="text-xs text-stone-500 mt-1">
            {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as EmailType)}
          className="border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="custom">Custom</option>
          <option value="invite">Invitation</option>
          <option value="save-the-date">Save the Date</option>
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="You're invited!"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-stone-700">Message (HTML)</label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs text-primary-600 hover:underline"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div
            className="border border-stone-200 rounded-lg p-4 min-h-[160px] text-sm prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="<p>Dear guests,</p><p>...</p>"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={sending || recipients.length === 0}
        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {sending ? "Sending…" : `Send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`}
      </button>

      {/* Results */}
      {results && (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <div className="bg-stone-50 px-4 py-2 text-xs font-medium text-stone-600 border-b border-stone-200">
            Send results — {results.filter((r) => r.ok).length}/{results.length} succeeded
          </div>
          <ul className="divide-y divide-stone-100">
            {results.map((r) => (
              <li key={r.email} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className={r.ok ? "text-green-600" : "text-red-500"}>
                  {r.ok ? "✓" : "✕"}
                </span>
                <span className="text-stone-700">{r.email}</span>
                {r.error && (
                  <span className="text-xs text-red-400 ml-auto">{r.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
