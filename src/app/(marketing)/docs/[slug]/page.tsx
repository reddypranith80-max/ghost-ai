import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, LinkCard, CtaBand, btnGhost } from "@/components/marketing/ui";
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
        <Hero eyebrow={`Docs · ${g.time} read`} title={g.title} lead={g.desc}>
          <Link href="/docs" className={btnGhost}>All guides</Link>
          <Link href="/api-reference" className={btnGhost}>API reference</Link>
        </Hero>
        <div className="container-page grid gap-10 pb-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24">
              <p className="mb-3 text-sm font-semibold text-[var(--text)]">On this page</p>
              <ul className="space-y-1 border-l border-[var(--hairline)]">
                {g.sections.map((s, i) => (
                  <li key={s.h}><a href={`#step-${i + 1}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--mint)] hover:text-[var(--text)]">{s.h}</a></li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="max-w-2xl">
            {g.sections.map((s, i) => (
              <section key={s.h} id={`step-${i + 1}`} className="scroll-mt-24 border-t border-[var(--hairline)] py-9 first:border-0 first:pt-2">
                <p className="eyebrow mb-2">Part {i + 1}</p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{s.h}</h2>
                <p className="mt-3 leading-[1.75] text-[var(--text-muted)]">{s.p}</p>
                {s.code && <div className="mt-5"><Code code={s.code} /></div>}
              </section>
            ))}
          </div>
        </div>
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
