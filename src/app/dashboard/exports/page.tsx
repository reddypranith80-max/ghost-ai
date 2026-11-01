import type { Metadata } from "next";
import { ExportsView } from "@/components/dashboard/exports";

export const metadata: Metadata = { title: "Exports" };

export default function Page() {
  return <ExportsView />;
}
