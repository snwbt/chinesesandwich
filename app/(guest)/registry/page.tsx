import { prisma } from "@/lib/prisma";

export default async function RegistryPage() {
  const links = await prisma.registryLink.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-serif text-stone-700 mb-2">Registry</h1>
      <p className="text-stone-500 mb-8">
        Your presence is the greatest gift. If you&apos;d like to give something, here are a few places we&apos;re registered.
      </p>
      {links.length === 0 ? (
        <p className="text-stone-400 italic">Registry links coming soon.</p>
      ) : (
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-stone-200 rounded-lg px-6 py-4 hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <span className="font-medium text-stone-700">{link.title}</span>
                <span className="ml-2 text-stone-400 text-sm">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
