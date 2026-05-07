"use client";

import { useState } from "react";
import type { CustomQuestion, Guest, RSVPResponse } from "@prisma/client";

type GuestWithResponse = Guest & { rsvpResponse: RSVPResponse | null };
type PartyWithGuests = { id: string; name: string; guests: GuestWithResponse[] };

interface Props {
  party: PartyWithGuests;
  questions: CustomQuestion[];
}

interface GuestState {
  attending: boolean | null;
  answers: Record<string, string | boolean>;
}

export default function RSVPForm({ party, questions }: Props) {
  const initialState: Record<string, GuestState> = {};
  for (const guest of party.guests) {
    const r = guest.rsvpResponse;
    initialState[guest.id] = {
      attending: r ? r.attending : null,
      answers: (r?.answers as Record<string, string | boolean>) ?? {},
    };
  }

  const [guestStates, setGuestStates] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function setAttending(guestId: string, attending: boolean) {
    setGuestStates((prev) => ({
      ...prev,
      [guestId]: { ...prev[guestId], attending },
    }));
  }

  function setAnswer(guestId: string, questionId: string, value: string | boolean) {
    setGuestStates((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        answers: { ...prev[guestId].answers, [questionId]: value },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const responses = party.guests
      .filter((g) => guestStates[g.id].attending !== null)
      .map((g) => ({
        guestId: g.id,
        attending: guestStates[g.id].attending!,
        answers: guestStates[g.id].answers,
      }));

    if (responses.length === 0) {
      setError("Please select attending or not attending for at least one guest.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyId: party.id, responses }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Submission failed. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-serif text-stone-700 mb-2">Thank you!</h2>
        <p className="text-stone-500">Your RSVP has been received. We can&apos;t wait to celebrate with you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {party.guests.map((guest) => {
        const state = guestStates[guest.id];
        return (
          <div key={guest.id} className="border border-stone-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-stone-700 mb-4">{guest.name}</h2>
            <fieldset className="mb-4">
              <legend className="sr-only">Will {guest.name} attend?</legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`attending-${guest.id}`}
                    checked={state.attending === true}
                    onChange={() => setAttending(guest.id, true)}
                    className="accent-primary-500"
                  />
                  <span className="text-stone-700">Attending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`attending-${guest.id}`}
                    checked={state.attending === false}
                    onChange={() => setAttending(guest.id, false)}
                    className="accent-primary-500"
                  />
                  <span className="text-stone-700">Not attending</span>
                </label>
              </div>
            </fieldset>

            {state.attending === true && questions.length > 0 && (
              <div className="space-y-4 mt-4 pt-4 border-t border-stone-100">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label
                      htmlFor={`q-${guest.id}-${q.id}`}
                      className="block text-sm font-medium text-stone-600 mb-1"
                    >
                      {q.label}
                      {q.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
                    </label>
                    {q.type === "text" && (
                      <input
                        id={`q-${guest.id}-${q.id}`}
                        type="text"
                        required={q.required}
                        value={(state.answers[q.id] as string) ?? ""}
                        onChange={(e) => setAnswer(guest.id, q.id, e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    )}
                    {q.type === "select" && (
                      <select
                        id={`q-${guest.id}-${q.id}`}
                        required={q.required}
                        value={(state.answers[q.id] as string) ?? ""}
                        onChange={(e) => setAnswer(guest.id, q.id, e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        <option value="">Select…</option>
                        {JSON.parse(q.options ?? "[]").map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {q.type === "boolean" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          id={`q-${guest.id}-${q.id}`}
                          type="checkbox"
                          checked={(state.answers[q.id] as boolean) ?? false}
                          onChange={(e) => setAnswer(guest.id, q.id, e.target.checked)}
                          className="accent-primary-500"
                        />
                        <span className="text-sm text-stone-600">Yes</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded px-4 py-3 transition-colors font-medium"
      >
        {submitting ? "Submitting…" : "Submit RSVP"}
      </button>
    </form>
  );
}
