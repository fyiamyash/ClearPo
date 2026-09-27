import { invoiceStore } from "../store/invoice";

export function InvoiceDetailPanel() {
  const selectedInvoice = invoiceStore((s) => s.selectedInvoice);
  if (!selectedInvoice) {
    console.error("No invoice selected");
    return;
  }
  return (
    <div className="bg-[#FAF6EE] h-screen w-full flex flex-col">
      <div className="flex-none px-10 pt-10 pb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Current invoice
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mt-2">{selectedInvoice.supplier_name}</h1>
        <div className="mt-3 text-base text-gray-500">
          #{selectedInvoice.invoice_number} · ${selectedInvoice.total_amount}
        </div>

        <div className="mt-8 flex items-center justify-between flex-wrap gap-6">
          <div className="flex gap-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Received
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {selectedInvoice.createdAt}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Account routing
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {selectedInvoice.purchase_order}
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors">
            Hold processing
          </button>
        </div>

        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-base font-bold text-gray-900">Live journey</div>
            <div className="text-sm text-gray-500 mt-1">
              Updates appear here as the invoice moves.
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Listening for updates
          </div>
        </div>
      </div>

      <div className="px-10">
        <div className="border-t border-gray-200/70 mx-4" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-10"></div>
    </div>
  );
}
