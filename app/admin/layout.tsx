import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSignOutButton from "@/components/admin/SignOutButton";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/registry", label: "Registry" },
  { href: "/admin/seating", label: "Seating" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-stone-100">
      <aside className="w-56 bg-white border-r border-stone-200 flex flex-col">
        <div className="px-6 py-5 border-b border-stone-200">
          <span className="font-serif text-stone-700 text-lg">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-3 py-2 rounded text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-4 border-t border-stone-200">
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
