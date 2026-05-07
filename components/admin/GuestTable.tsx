"use client";

import { useState } from "react";
import type { Guest, Party, RSVPResponse } from "@prisma/client";

type GuestWithRelations = Guest & {
  party: Party;
  rsvpResponse: RSVPResponse | null;
};

interface Props {
  guests: GuestWithRelations[];
  parties: Party[];
}

export default function GuestTable({ guests: initialGuests, parties }: Props) {
  const [guests, setGuests] = useState(initialGuests);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPartyId, setNewPartyId] = useState(parties[0]?.id ?? "");
  const [newPartyName, setNewPartyName] = useState("");
  const [useNewParty, setUseNewParty] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.party.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        email: newEmail || undefined,
        ...(useNewParty ? { partyName: newPartyName } : { partyId: newPartyId }),
      }),
    });
    if (res.ok) {
      const guest = await res.json();
      setGuests((prev) => [...prev, guest]);
      setNewName("");
      setNewEmail("");
      setShowAdd(false);
    }
    setSaving(false);
  }

  async function handleDelete(guestId: string) {
    if (!confirm("Delete this guest?")) return;
    const res = await fetch(`/api/admin/guests/${guestId}`, { method: "DELETE" });
    if (res.ok) {
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="search"
          placeholder="Search guests or parties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Add Guest
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-stone-600 mb-2 cursor-pointer">
              <input type="checkbox" checked={useNewParty} onChange={(e) => setUseNewParty(e.target.checked)} />
              Create new party
            </label>
            {useNewParty ? (
              <input
                type="text"
                placeholder="Party name"
                required
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            ) : (
              <select
                value={newPartyId}
                onChange={(e) => setNewPartyId(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.inviteCode})</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="border border-stone-300 text-stone-600 px-4 py-2 rounded text-sm hover:bg-stone-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Party</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Invite Code</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">RSVP</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((guest) => (
              <tr key={guest.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800">{guest.name}</td>
                <td className="px-4 py-3 text-stone-500">{guest.party.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{guest.party.inviteCode}</td>
                <td className="px-4 py-3">
                  {guest.rsvpResponse ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${guest.rsvpResponse.attending ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {guest.rsvpResponse.attending ? "Attending" : "Declined"}
                    </span>
                  ) : (
                    <span className="text-stone-400 text-xs">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(guest.id)}
                    className="text-red-500 hover:text-red-700 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">No guests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-400 mt-2">{filtered.length} of {guests.length} guests</p>
    </div>
  );
}
