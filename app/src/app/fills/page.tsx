import { FillsFeed } from "@/components/fills-feed";
import { RaydiumFeed } from "@/components/raydium-feed";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Fills — Shadow Book" };

export default function FillsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Fills"
        subtitle="What settles is public. What produced it isn't. Compare with Raydium below — every leg of every trade leaks there."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">
        <FillsFeed limit={50} />
        <RaydiumFeed limit={20} />
      </div>
    </>
  );
}
