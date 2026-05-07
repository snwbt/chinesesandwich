"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, useDraggable } from "@dnd-kit/core";
import type { Guest, Party, SeatAssignment, Table } from "@prisma/client";

type AssignmentWithGuest = SeatAssignment & { guest: Guest & { party: Party } };
type TableWithAssignments = Table & { assignments: AssignmentWithGuest[] };
type UnassignedGuest = Guest & { party: Party };

function DraggableGuest({ guest }: { guest: UnassignedGuest | (Guest & { party: Party }) }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-stone-200 rounded px-3 py-2 text-sm cursor-grab select-none hover:border-primary-400 transition-colors"
    >
      <p className="font-medium text-stone-700">{guest.name}</p>
      <p className="text-xs text-stone-400">{guest.party.name}</p>
    </div>
  );
}

function DroppableTable({
  table,
  onRemove,
}: {
  table: TableWithAssignments;
  onRemove: (guestId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: table.id });
  const remaining = table.capacity - table.assignments.length;

  return (
    <div
      ref={setNodeRef}
      className={`border-2 rounded-lg p-4 transition-colors ${
        isOver ? "border-primary-400 bg-primary-50" : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-stone-700">{table.name}</h3>
        <span className="text-xs text-stone-400">{remaining} seat{remaining !== 1 ? "s" : ""} left</span>
      </div>
      <div className="space-y-2 min-h-[60px]">
        {table.assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded px-3 py-2">
            <div>
              <p className="text-sm font-medium text-stone-700">{a.guest.name}</p>
              <p className="text-xs text-stone-400">{a.guest.party.name}</p>
            </div>
            <button
              onClick={() => onRemove(a.guestId)}
              className="text-stone-400 hover:text-red-500 text-xs transition-colors"
              aria-label={`Remove ${a.guest.name}`}
            >
              ✕
            </button>
          </div>
        ))}
        {table.assignments.length === 0 && (
          <p className="text-xs text-stone-400 italic text-center py-2">Drop guests here</p>
        )}
      </div>
    </div>
  );
}

export default function SeatingChart() {
  const [tables, setTables] = useState<TableWithAssignments[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGuest, setActiveGuest] = useState<(Guest & { party: Party }) | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);

  async function loadData() {
    const res = await fetch("/api/admin/seating");
    if (res.ok) {
      const data = await res.json();
      setTables(data.tables);
      setUnassigned(data.unassigned);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveGuest(event.active.data.current?.guest ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null);
    const { active, over } = event;
    if (!over) return;

    const guestId = String(active.id);
    const tableId = String(over.id);

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    if (table.assignments.length >= table.capacity) return;

    const res = await fetch("/api/admin/seating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, tableId }),
    });

    if (res.ok) loadData();
  }

  async function handleRemove(guestId: string) {
    await fetch(`/api/admin/seating?guestId=${guestId}`, { method: "DELETE" });
    loadData();
  }

  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTableName, capacity: newTableCapacity }),
    });
    if (res.ok) {
      setNewTableName("");
      loadData();
    }
  }

  if (loading) return <p className="text-stone-400">Loading seating chart…</p>;

  return (
    <div>
      <form onSubmit={handleAddTable} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Table Name</label>
          <input
            type="text"
            required
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table 1"
            className="border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Capacity</label>
          <input
            type="number"
            min={1}
            max={50}
            value={newTableCapacity}
            onChange={(e) => setNewTableCapacity(Number(e.target.value))}
            className="w-20 border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Add Table
        </button>
      </form>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6">
          {/* Unassigned guests panel */}
          <div className="w-56 shrink-0">
            <h2 className="text-sm font-medium text-stone-600 mb-3">Unassigned ({unassigned.length})</h2>
            <div className="space-y-2">
              {unassigned.map((guest) => (
                <DraggableGuest key={guest.id} guest={guest} />
              ))}
              {unassigned.length === 0 && (
                <p className="text-xs text-stone-400 italic">All guests assigned!</p>
              )}
            </div>
          </div>

          {/* Tables grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tables.map((table) => (
              <DroppableTable key={table.id} table={table} onRemove={handleRemove} />
            ))}
            {tables.length === 0 && (
              <p className="text-stone-400 italic col-span-3">No tables yet. Add one above.</p>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeGuest && (
            <div className="bg-white border-2 border-primary-400 rounded px-3 py-2 text-sm shadow-lg">
              <p className="font-medium text-stone-700">{activeGuest.name}</p>
              <p className="text-xs text-stone-400">{activeGuest.party.name}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
