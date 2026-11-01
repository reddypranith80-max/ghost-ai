import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, btnGhost } from "@/components/marketing/ui";
import { Code } from "@/components/marketing/copy-button";
import { GUIDES } from "@/components/marketing/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  return g ? { title: `${g.title} | Ghost AI docs`, description: g.desc } : {};
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow={`Docs // ${g.time} read`} title={g.title} lead={g.desc}>
          <Link href="/docs" className={btnGhost}>All guides</Link>
          <Link href="/api-reference" className={btnGhost}>API reference</Link>
        </Hero>
        {g.sections.map((s, i) => (
          <Section key={s.h} title={s.h} kicker={`Part ${i + 1}`}>
            <Panel><p className="text-sm leading-relaxed text-white/85">{s.p}</p>{s.code && <div className="mt-3"><Code code={s.code} /></div>}</Panel>
          </Section>
        ))}
        <Section title="Keep reading" kicker="Next">
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map((o) => <LinkCard key={o.slug} href={o.slug === "api" ? "/api-reference" : `/docs/${o.slug}`} title={o.title} desc={o.desc} tag={o.time} />)}
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
