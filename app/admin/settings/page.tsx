import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div>
      <h1 className="text-2xl font-serif text-stone-700 mb-6">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
