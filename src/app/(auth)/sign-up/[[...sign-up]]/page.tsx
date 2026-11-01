import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign up | Ghost.AI" };

export function generateStaticParams() {
  return [{ "sign-up": [] }];
}

export default function Page() {
  return <AuthShell mode="sign-up" />;
}
