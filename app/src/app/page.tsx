import { Hero } from "@/components/hero";
import { PairStats } from "@/components/pair-stats";
import { LeakComparison } from "@/components/leak-comparison";
import { NetworkStatus } from "@/components/network-status";
import { HowItWorks } from "@/components/how-it-works";
import { FeatureGrid } from "@/components/feature-grid";

export default function Home() {
  return (
    <>
      <Hero />

      <FeatureGrid />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 mb-reveal mb-reveal-1"><PairStats /></div>
          <div className="mb-reveal mb-reveal-2"><NetworkStatus /></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-reveal"><LeakComparison /></div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-6 pb-20 scroll-mt-20">
        <HowItWorks />
      </section>
    </>
  );
}
