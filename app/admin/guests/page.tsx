import { prisma } from "@/lib/prisma";
import GuestTable from "@/components/admin/GuestTable";

export default async function GuestsPage() {
  const guests = await prisma.guest.findMany({
    include: { party: true, rsvpResponse: true },
    orderBy: { name: "asc" },
  });

  const parties = await prisma.party.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-stone-700">Guests</h1>
        <div className="flex gap-3">
          <a
            href="/api/admin/export"
            className="border border-stone-300 hover:border-primary-400 text-stone-700 px-3 py-2 rounded text-sm transition-colors"
          >
            Export CSV
          </a>
        </div>
      </div>
      <GuestTable guests={guests} parties={parties} />
    </div>
  );
}
