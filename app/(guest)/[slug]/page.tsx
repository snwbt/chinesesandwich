import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) notFound();

  return (
    <article className="prose prose-stone max-w-2xl mx-auto">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
