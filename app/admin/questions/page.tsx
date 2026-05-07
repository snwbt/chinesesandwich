import { prisma } from "@/lib/prisma";
import QuestionsEditor from "@/components/admin/QuestionsEditor";

export default async function QuestionsPage() {
  const questions = await prisma.customQuestion.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">RSVP Questions</h1>
      <QuestionsEditor questions={questions} />
    </div>
  );
}
