import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TravelPage() {
  const page = await prisma.page.findUnique({ where: { slug: "travel" } });
  if (!page || !page.published) notFound();

  const mapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  return (
    <div className="max-w-2xl mx-auto">
      <article className="prose prose-stone mb-8">
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
      {mapsUrl && (
        <div className="rounded overflow-hidden border border-stone-200">
          <iframe
            src={mapsUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue location map"
          />
        </div>
      )}
    </div>
  );
}
