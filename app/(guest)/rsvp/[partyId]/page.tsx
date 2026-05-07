import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RSVPForm from "@/components/rsvp/RSVPForm";

interface Props {
  params: Promise<{ partyId: string }>;
}

export default async function RSVPFormPage({ params }: Props) {
  const { partyId } = await params;

  const [party, questions, settings] = await Promise.all([
    prisma.party.findUnique({
      where: { id: partyId },
      include: {
        guests: {
          include: { rsvpResponse: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.customQuestion.findMany({ orderBy: { order: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!party) notFound();

  const cutoffPassed =
    settings?.rsvpCutoff && new Date() > settings.rsvpCutoff;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-serif text-stone-700 mb-1">RSVP</h1>
      <p className="text-stone-500 mb-8">
        Party: <strong>{party.name}</strong>
      </p>
      {cutoffPassed ? (
        <p className="text-red-600">
          The RSVP deadline has passed. Please contact us directly.
        </p>
      ) : (
        <RSVPForm party={party} questions={questions} />
      )}
    </div>
  );
}
