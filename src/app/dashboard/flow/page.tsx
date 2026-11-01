import type { Metadata } from "next";
import { FlowView } from "@/components/dashboard/flow";

export const metadata: Metadata = { title: "Flow" };

export default function Page() {
  return <FlowView />;
}
