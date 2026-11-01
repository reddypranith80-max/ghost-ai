import { Hero, Stats } from "./hero";
import { StackMarquee, Bento, Timeline, UseCases, DemoTeaser, PricingTeaser, Faq, FinalCta } from "./static-sections";
import { IoDemo } from "./io-demo";
import { Crew } from "./crew";

export function Landing() {
  return (
    <>
      <Hero />
      <Stats />
      <Bento />
      <IoDemo />
      <Crew />
      <Timeline />
      <StackMarquee />
      <UseCases />
      <DemoTeaser />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}
