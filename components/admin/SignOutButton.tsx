"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
    >
      Sign out
    </button>
  );
}
