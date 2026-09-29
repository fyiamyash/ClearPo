import { InvoiceDetailPanel } from "../components/DetailSection";
import { InvoiceSidebar } from "../components/SideBar";
import { useInvoice } from "../hooks/invoice";
import { invoiceStore } from "../store/invoice";

export function HomePage() {
  const invoices = invoiceStore((s) => s.invoices);

  const { getInvoice } = useInvoice();

  console.log(invoices);
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <InvoiceSidebar invoices={invoices} onRefresh={getInvoice} />
      <InvoiceDetailPanel />
    </div>
  );
}
