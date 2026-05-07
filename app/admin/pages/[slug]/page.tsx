import { prisma } from "@/lib/prisma";
import PageEditor from "@/components/admin/PageEditor";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PageEditPage({ params }: Props) {
  const { slug } = await params;
  const isNew = slug === "new";

  const page = isNew
    ? null
    : await prisma.page.findUnique({ where: { slug } });

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">
        {isNew ? "New Page" : `Edit: ${page?.title ?? slug}`}
      </h1>
      <PageEditor page={page} defaultSlug={isNew ? "" : slug} />
    </div>
  );
}
