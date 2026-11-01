import { Hero } from "./hero";
import { Facts, StackStrip, Bento, Flow, DemoTeaser, PricingTeaser, Faq, FinalCta } from "./static-sections";
import { Crew } from "./crew";
import { PipelineSection } from "./pipeline-diagram";

export function Landing() {
  return (
    <>
      <Hero />
      <StackStrip />
      <Facts />
      <Bento />
      <PipelineSection />
      <Crew />
      <Flow />
      <DemoTeaser />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}
