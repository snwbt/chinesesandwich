import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function WelcomePage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-serif text-stone-700 mb-4">
        {settings?.coupleNames ?? "Our Wedding"}
      </h1>
      {settings?.weddingDate && (
        <p className="text-xl text-stone-500 mb-8">
          {formatDate(settings.weddingDate)}
        </p>
      )}
      <div className="flex justify-center gap-4 flex-wrap">
        <a
          href="/rsvp"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded transition-colors"
        >
          RSVP Now
        </a>
        <a
          href="/about"
          className="border border-stone-300 hover:border-primary-400 text-stone-700 px-6 py-3 rounded transition-colors"
        >
          Our Story
        </a>
      </div>
    </div>
  );
}
