import type { Guest, Party, SeatAssignment, Table } from "@prisma/client";

export type TableWithAssignments = Table & {
  assignments: (SeatAssignment & { guest: Guest })[];
};

export type SeatingState = {
  tables: TableWithAssignments[];
  unassigned: (Guest & { party: Party })[];
};

export function getTableCapacityRemaining(table: TableWithAssignments): number {
  return table.capacity - table.assignments.length;
}

export function isTableFull(table: TableWithAssignments): boolean {
  return getTableCapacityRemaining(table) <= 0;
}

export function validateSeatAssignment(
  guestId: string,
  table: TableWithAssignments
): { valid: boolean; error?: string } {
  if (isTableFull(table)) {
    return { valid: false, error: `Table "${table.name}" is at full capacity` };
  }
  const alreadyAssigned = table.assignments.some(
    (a) => a.guestId === guestId
  );
  if (alreadyAssigned) {
    return { valid: false, error: "Guest is already assigned to this table" };
  }
  return { valid: true };
}
