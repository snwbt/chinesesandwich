import type { CustomQuestion, Guest, Party, RSVPResponse } from "@prisma/client";

export interface GuestRSVPInput {
  guestId: string;
  attending: boolean;
  answers: Record<string, string | boolean>;
}

export interface RSVPSubmission {
  partyId: string;
  responses: GuestRSVPInput[];
}

export interface ValidationError {
  guestId: string;
  field: string;
  message: string;
}

export function validateRSVPSubmission(
  party: Party & { guests: Guest[] },
  responses: GuestRSVPInput[],
  questions: CustomQuestion[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const guestIds = new Set(party.guests.map((g) => g.id));

  for (const response of responses) {
    if (!guestIds.has(response.guestId)) {
      errors.push({
        guestId: response.guestId,
        field: "guestId",
        message: "Guest does not belong to this party",
      });
      continue;
    }

    if (!response.attending) continue;

    for (const question of questions) {
      if (!question.required) continue;
      const answer = response.answers[question.id];
      if (answer === undefined || answer === null || answer === "") {
        errors.push({
          guestId: response.guestId,
          field: question.id,
          message: `${question.label} is required`,
        });
      }
    }
  }

  return errors;
}

export function buildRSVPSummaryHtml(
  party: Party & { guests: (Guest & { rsvpResponse: RSVPResponse | null })[] },
  questions: CustomQuestion[]
): string {
  const attending = party.guests.filter((g) => g.rsvpResponse?.attending);
  const declining = party.guests.filter(
    (g) => g.rsvpResponse && !g.rsvpResponse.attending
  );

  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q.label]));

  const rows = attending
    .map((g) => {
      const answers = g.rsvpResponse?.answers as Record<string, string> ?? {};
      const answerLines = Object.entries(answers)
        .map(([qId, val]) => `<li>${questionMap[qId] ?? qId}: ${val}</li>`)
        .join("");
      return `<p><strong>${g.name}</strong> — Attending<ul>${answerLines}</ul></p>`;
    })
    .join("");

  const declineRows = declining
    .map((g) => `<p><strong>${g.name}</strong> — Not attending</p>`)
    .join("");

  return `
    <h2>RSVP Confirmation for ${party.name}</h2>
    ${rows}
    ${declineRows}
    <p>Thank you for your response!</p>
  `;
}
