import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PagesListPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-stone-700">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          New Page
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Slug</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-stone-600 text-xs">/{page.slug}</td>
                <td className="px-4 py-3 text-stone-800">{page.title}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${page.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {page.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${page.slug}`} className="text-primary-600 hover:underline text-xs">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
