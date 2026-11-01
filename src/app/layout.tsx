import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ghost AI | Multi-agent SaaS builder", template: "%s | Ghost AI" },
  description:
    "Feed Ghost AI a goal and a tech stack, then watch specialised agents plan, build, review and ship your SaaS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable} ${jetbrains.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
