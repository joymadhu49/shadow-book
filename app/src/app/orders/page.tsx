import { MyOrders } from "@/components/my-orders";
import { TeeStatus } from "@/components/tee-status";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Orders — Shadow Book" };

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Orders"
        subtitle="Your hidden book inside the TEE. Cancel any time before settlement."
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4">
            <TeeStatus />
          </div>
          <div className="lg:col-span-8">
            <MyOrders />
          </div>
        </div>
      </div>
    </>
  );
}
