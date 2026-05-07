import { prisma } from "@/lib/prisma";
import RegistryEditor from "@/components/admin/RegistryEditor";

export default async function AdminRegistryPage() {
  const links = await prisma.registryLink.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">Registry Links</h1>
      <RegistryEditor links={links} />
    </div>
  );
}
