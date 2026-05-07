import { describe, it, expect } from 'vitest';
import {
  validateRSVPSubmission,
  buildRSVPSummaryHtml,
  type GuestRSVPInput,
} from '@/lib/rsvp';
import type { CustomQuestion, Guest, Party, RSVPResponse } from '@prisma/client';

const baseParty: Party = {
  id: 'party-1',
  name: 'Smith Family',
  inviteCode: 'SMITH2025',
  email: null,
  createdAt: new Date(),
};

const guest1: Guest = {
  id: 'guest-1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  partyId: 'party-1',
  createdAt: new Date(),
};

const guest2: Guest = {
  id: 'guest-2',
  name: 'Bob Smith',
  email: null,
  partyId: 'party-1',
  createdAt: new Date(),
};

const party = { ...baseParty, guests: [guest1, guest2] };

const questions: CustomQuestion[] = [
  {
    id: 'q-1',
    label: 'Meal choice',
    type: 'select',
    options: JSON.stringify(['Chicken', 'Fish', 'Vegetarian']),
    required: true,
    order: 0,
  },
  {
    id: 'q-2',
    label: 'Dietary restrictions',
    type: 'text',
    options: null,
    required: false,
    order: 1,
  },
];

describe('validateRSVPSubmission', () => {
  it('returns no errors for a valid attending submission', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-1', attending: true, answers: { 'q-1': 'Chicken' } },
      { guestId: 'guest-2', attending: false, answers: {} },
    ];
    expect(validateRSVPSubmission(party, responses, questions)).toEqual([]);
  });

  it('skips required question validation for non-attending guests', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-1', attending: false, answers: {} },
    ];
    expect(validateRSVPSubmission(party, responses, questions)).toEqual([]);
  });

  it('returns error when attending guest is missing a required answer', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-1', attending: true, answers: {} },
    ];
    const errors = validateRSVPSubmission(party, responses, questions);
    expect(errors).toHaveLength(1);
    expect(errors[0].guestId).toBe('guest-1');
    expect(errors[0].field).toBe('q-1');
  });

  it('does not require optional questions', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-1', attending: true, answers: { 'q-1': 'Fish' } },
    ];
    expect(validateRSVPSubmission(party, responses, questions)).toEqual([]);
  });

  it('returns error for guest not belonging to the party', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-999', attending: true, answers: {} },
    ];
    const errors = validateRSVPSubmission(party, responses, questions);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('guestId');
  });

  it('accumulates errors across multiple guests', () => {
    const responses: GuestRSVPInput[] = [
      { guestId: 'guest-1', attending: true, answers: {} },
      { guestId: 'guest-2', attending: true, answers: {} },
    ];
    const errors = validateRSVPSubmission(party, responses, questions);
    expect(errors).toHaveLength(2);
  });
});

describe('buildRSVPSummaryHtml', () => {
  const rsvpParty = {
    ...baseParty,
    guests: [
      {
        ...guest1,
        rsvpResponse: {
          id: 'r-1',
          guestId: 'guest-1',
          attending: true,
          answers: { 'q-1': 'Chicken' },
          submittedAt: new Date(),
          updatedAt: new Date(),
        } as RSVPResponse,
      },
      {
        ...guest2,
        rsvpResponse: {
          id: 'r-2',
          guestId: 'guest-2',
          attending: false,
          answers: {},
          submittedAt: new Date(),
          updatedAt: new Date(),
        } as RSVPResponse,
      },
    ],
  };

  it('includes attending guest name in output', () => {
    const html = buildRSVPSummaryHtml(rsvpParty, questions);
    expect(html).toContain('Alice Smith');
    expect(html).toContain('Attending');
  });

  it('includes declining guest name in output', () => {
    const html = buildRSVPSummaryHtml(rsvpParty, questions);
    expect(html).toContain('Bob Smith');
    expect(html).toContain('Not attending');
  });

  it('includes answer values for attending guests', () => {
    const html = buildRSVPSummaryHtml(rsvpParty, questions);
    expect(html).toContain('Chicken');
  });

  it('includes party name in heading', () => {
    const html = buildRSVPSummaryHtml(rsvpParty, questions);
    expect(html).toContain('Smith Family');
  });
});
