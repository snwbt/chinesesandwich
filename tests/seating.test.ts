import { describe, it, expect } from 'vitest';
import {
  getTableCapacityRemaining,
  isTableFull,
  validateSeatAssignment,
  type TableWithAssignments,
} from '@/lib/seating';
import type { Guest, SeatAssignment, Table } from '@prisma/client';

const baseTable: Table = {
  id: 'table-1',
  name: 'Table 1',
  capacity: 4,
};

const guest1: Guest = {
  id: 'guest-1',
  name: 'Alice',
  email: null,
  partyId: 'party-1',
  createdAt: new Date(),
};

function makeAssignment(guestId: string, guest: Guest): SeatAssignment & { guest: Guest } {
  return {
    id: `assign-${guestId}`,
    tableId: 'table-1',
    guestId,
    seat: null,
    guest,
  };
}

describe('getTableCapacityRemaining', () => {
  it('returns full capacity when no assignments', () => {
    const table: TableWithAssignments = { ...baseTable, assignments: [] };
    expect(getTableCapacityRemaining(table)).toBe(4);
  });

  it('returns reduced capacity after assignments', () => {
    const table: TableWithAssignments = {
      ...baseTable,
      assignments: [
        makeAssignment('guest-1', guest1),
        makeAssignment('guest-2', { ...guest1, id: 'guest-2' }),
      ],
    };
    expect(getTableCapacityRemaining(table)).toBe(2);
  });

  it('returns 0 when table is full', () => {
    const assignments = ['g1', 'g2', 'g3', 'g4'].map((id) =>
      makeAssignment(id, { ...guest1, id })
    );
    const table: TableWithAssignments = { ...baseTable, assignments };
    expect(getTableCapacityRemaining(table)).toBe(0);
  });
});

describe('isTableFull', () => {
  it('returns false when seats remain', () => {
    const table: TableWithAssignments = { ...baseTable, assignments: [] };
    expect(isTableFull(table)).toBe(false);
  });

  it('returns true when at capacity', () => {
    const assignments = ['g1', 'g2', 'g3', 'g4'].map((id) =>
      makeAssignment(id, { ...guest1, id })
    );
    const table: TableWithAssignments = { ...baseTable, assignments };
    expect(isTableFull(table)).toBe(true);
  });
});

describe('validateSeatAssignment', () => {
  it('returns valid for an empty table', () => {
    const table: TableWithAssignments = { ...baseTable, assignments: [] };
    expect(validateSeatAssignment('guest-1', table)).toEqual({ valid: true });
  });

  it('returns error when table is full', () => {
    const assignments = ['g1', 'g2', 'g3', 'g4'].map((id) =>
      makeAssignment(id, { ...guest1, id })
    );
    const table: TableWithAssignments = { ...baseTable, assignments };
    const result = validateSeatAssignment('guest-5', table);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('full capacity');
  });

  it('returns error when guest is already assigned to the table', () => {
    const table: TableWithAssignments = {
      ...baseTable,
      assignments: [makeAssignment('guest-1', guest1)],
    };
    const result = validateSeatAssignment('guest-1', table);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('already assigned');
  });

  it('returns valid when guest is not yet at this table', () => {
    const table: TableWithAssignments = {
      ...baseTable,
      assignments: [makeAssignment('guest-1', guest1)],
    };
    expect(validateSeatAssignment('guest-2', table)).toEqual({ valid: true });
  });
});
