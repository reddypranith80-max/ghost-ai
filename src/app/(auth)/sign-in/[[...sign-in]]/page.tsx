import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign in | Ghost.AI" };

// Required for the static GitHub Pages export of an optional catch-all.
export function generateStaticParams() {
  return [{ "sign-in": [] }];
}

export default function Page() {
  return <AuthShell mode="sign-in" />;
}
