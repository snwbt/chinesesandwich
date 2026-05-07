import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalGuests, totalRSVPs, attending, parties] = await Promise.all([
    prisma.guest.count(),
    prisma.rSVPResponse.count(),
    prisma.rSVPResponse.count({ where: { attending: true } }),
    prisma.party.count(),
  ]);

  const pending = totalGuests - totalRSVPs;

  const stats = [
    { label: "Total Guests", value: totalGuests },
    { label: "Parties", value: parties },
    { label: "RSVPs Received", value: totalRSVPs },
    { label: "Attending", value: attending },
    { label: "Not Attending", value: totalRSVPs - attending },
    { label: "Awaiting Response", value: pending },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-stone-200 p-5">
            <p className="text-3xl font-bold text-stone-800">{s.value}</p>
            <p className="text-sm text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/guests" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Manage Guests
        </Link>
        <Link href="/admin/emails" className="border border-stone-300 hover:border-primary-400 text-stone-700 px-4 py-2 rounded text-sm transition-colors">
          Send Emails
        </Link>
        <Link href="/admin/seating" className="border border-stone-300 hover:border-primary-400 text-stone-700 px-4 py-2 rounded text-sm transition-colors">
          Seating Chart
        </Link>
        <a href="/api/admin/export" className="border border-stone-300 hover:border-primary-400 text-stone-700 px-4 py-2 rounded text-sm transition-colors">
          Export CSV
        </a>
      </div>
    </div>
  );
}
