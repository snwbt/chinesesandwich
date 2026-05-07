import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function FAQPage() {
  const page = await prisma.page.findUnique({ where: { slug: "faq" } });
  if (!page || !page.published) notFound();

  return (
    <article className="prose prose-stone max-w-2xl mx-auto">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
