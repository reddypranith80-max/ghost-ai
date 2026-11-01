import type { Metadata } from "next";
import { GitView } from "@/components/dashboard/gitlog";

export const metadata: Metadata = { title: "Git Log" };

export default function Page() {
  return <GitView />;
}
