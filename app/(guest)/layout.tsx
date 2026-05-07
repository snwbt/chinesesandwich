import Link from "next/link";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-stone-200">
        <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/welcome" className="text-xl font-serif text-stone-700 hover:text-primary-600">
            Our Wedding
          </Link>
          <ul className="flex gap-6 text-sm text-stone-600">
            <li><Link href="/about" className="hover:text-primary-600">About Us</Link></li>
            <li><Link href="/rsvp" className="hover:text-primary-600">RSVP</Link></li>
            <li><Link href="/registry" className="hover:text-primary-600">Registry</Link></li>
            <li><Link href="/travel" className="hover:text-primary-600">Travel</Link></li>
            <li><Link href="/faq" className="hover:text-primary-600">FAQ</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-stone-200 text-center text-stone-400 text-xs py-6">
        Made with love
      </footer>
    </div>
  );
}
