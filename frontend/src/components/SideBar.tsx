import { InvoiceCard } from "./CardComponent";

interface Invoice {
  invoiceId: string;
  clientName: string;
  amount: string;
  status: string;
}

interface InvoiceSidebarProps {
  invoices: Invoice[];
}

export function InvoiceSidebar({ invoices }: InvoiceSidebarProps) {
  return (
    <div className="bg-[#FFFCF8] h-screen w-full max-w-sm flex flex-col border-x border-gray-200">
      <div className="flex-none px-6 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Invoice Desk
            </div>
            <div className="text-2xl font-medium text-gray-900 mt-1">Inbound</div>
          </div>
          <button
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Refresh"
          >
            ⟳
          </button>
        </div>
        <div className="border-t border-gray-200 mt-5" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-3 px-4 py-3">
          {invoices.map((invoice, i) => (
            <InvoiceCard key={invoice.invoiceId} {...invoice} highlighted={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
