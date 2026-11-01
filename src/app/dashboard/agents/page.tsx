import type { Metadata } from "next";
import { AgentsView } from "@/components/dashboard/agents";

export const metadata: Metadata = { title: "Agents" };

export default function Page() {
  return <AgentsView />;
}
