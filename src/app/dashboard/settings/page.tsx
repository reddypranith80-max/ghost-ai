import type { Metadata } from "next";
import { SettingsView } from "@/components/dashboard/settings";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
