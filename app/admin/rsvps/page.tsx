import { prisma } from "@/lib/prisma";

export default async function RSVPsPage() {
  const responses = await prisma.rSVPResponse.findMany({
    include: { guest: { include: { party: true } } },
    orderBy: { submittedAt: "desc" },
  });

  const questions = await prisma.customQuestion.findMany({ orderBy: { order: "asc" } });
  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q.label]));

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">RSVP Responses</h1>
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Guest</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Party</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Attending</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Submitted</th>
              {questions.map((q) => (
                <th key={q.id} className="text-left px-4 py-3 text-stone-600 font-medium">{q.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {responses.map((r) => {
              const answers = r.answers as Record<string, string>;
              return (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-800">{r.guest.name}</td>
                  <td className="px-4 py-3 text-stone-500">{r.guest.party.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${r.attending ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.attending ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </td>
                  {questions.map((q) => (
                    <td key={q.id} className="px-4 py-3 text-stone-600">
                      {String(answers[q.id] ?? "—")}
                    </td>
                  ))}
                </tr>
              );
            })}
            {responses.length === 0 && (
              <tr>
                <td colSpan={4 + questions.length} className="px-4 py-8 text-center text-stone-400">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
