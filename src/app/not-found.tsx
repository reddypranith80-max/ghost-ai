import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Hero, LinkCard, btnPrimary } from "@/components/marketing/ui";

export default function NotFound() {
  return (
    <SiteShell>
      <Hero eyebrow="Error 404" title={<>This page <span className="gh-text-gradient">went ghost</span></>} lead="The page you wanted does not exist or has moved. Try one of these instead.">
        <Link href="/" className={btnPrimary}>Back home</Link>
      </Hero>
      <div className="container-page grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        <LinkCard href="/how-it-works" title="How it works" desc="The pipeline in simple words." />
        <LinkCard href="/agents" title="Agents" desc="All eight leads." />
        <LinkCard href="/docs" title="Docs" desc="Guides and API reference." />
        <LinkCard href="/dashboard" title="Dashboard" desc="Try the live app." />
      </div>
    </SiteShell>
  );
}
