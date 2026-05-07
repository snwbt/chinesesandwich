import EmailComposer from "@/components/admin/EmailComposer";
import { prisma } from "@/lib/prisma";

export default async function EmailsPage() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  const guests = await prisma.guest.findMany({
    where: { email: { not: null } },
    select: { id: true, name: true, email: true, party: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">Emails</h1>
      <EmailComposer guests={guests} />
      <div className="mt-10">
        <h2 className="text-lg font-medium text-stone-700 mb-4">Send History</h2>
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">To</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-600">{log.to}</td>
                  <td className="px-4 py-3 text-stone-800">{log.subject}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{log.type}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">No emails sent yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
