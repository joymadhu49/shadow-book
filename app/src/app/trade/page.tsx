import { PairStrip } from "@/components/pair-strip";
import { TradePanel } from "@/components/trade-panel";
import { OrderBookHidden } from "@/components/order-book-hidden";
import { MyOrders } from "@/components/my-orders";
import { FillsFeed } from "@/components/fills-feed";
import { NetworkStatus } from "@/components/network-status";

export const metadata = { title: "Trade — Shadow Book" };

export default function TradePage() {
  return (
    <>
      <PairStrip />
      <section className="max-w-7xl w-full mx-auto px-6 py-4 flex-1 flex flex-col gap-4">
        {/* Top: trade panel + book */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 mb-reveal mb-reveal-1">
            <TradePanel />
          </div>
          <div className="lg:col-span-8 mb-reveal mb-reveal-2">
            <OrderBookHidden />
          </div>
        </div>

        {/* Bottom: orders + fills + network */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 mb-reveal mb-reveal-3">
            <MyOrders />
          </div>
          <div className="lg:col-span-4 mb-reveal mb-reveal-4">
            <FillsFeed limit={6} />
          </div>
          <div className="lg:col-span-3 mb-reveal mb-reveal-5">
            <NetworkStatus />
          </div>
        </div>
      </section>
    </>
  );
}
