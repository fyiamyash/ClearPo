import { useEffect, useRef, useState } from "react";
import { invoiceStore } from "../store/invoice";
import { InvoiceCard } from "./CardComponent";

export type sidebarInvoice = {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  purchase_order: string | null;
  status: string | null;
  createdAt: string;
};

interface InvoiceSidebarProps {
  invoices: sidebarInvoice[];
  onRefresh: () => Promise<void>;
}

export function InvoiceSidebar({ invoices, onRefresh }: InvoiceSidebarProps) {
  const setSelectedInvoice = invoiceStore((s) => s.setSelectedInvoice);
  const selectedInvoice = invoiceStore((s) => s.selectedInvoice);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const seenIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const [newIds, setNewIds] = useState<Map<string, number>>(new Map());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error(err); // old list stays visible if the request fails
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const currentIds = new Set(invoices.map((i) => i.id));

    if (isFirstLoad.current) {
      if (invoices.length > 0) {
        isFirstLoad.current = false;
        seenIds.current = currentIds;
      }
      return;
    }

    const added = invoices.filter((i) => !seenIds.current.has(i.id));
    seenIds.current = currentIds;

    if (added.length > 0) {
      setNewIds(new Map(added.map((inv, idx) => [inv.id, idx])));
      const t = setTimeout(() => setNewIds(new Map()), 1200);
      return () => clearTimeout(t);
    }
  }, [invoices]);

  useEffect(() => {
    if (!selectedInvoice) return;
    const fresh = invoices.find((i) => i.id === selectedInvoice.id);
    if (fresh && fresh !== selectedInvoice) setSelectedInvoice(fresh);
  }, [invoices]);

  return (
    <aside className="sidebar-panel">
      <div className="flex-none px-6 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="eyebrow sidebar-eyebrow">
              Invoice Desk
            </div>
            <div className="sidebar-title">Inbound</div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="refresh-button"
            aria-label="Refresh"
          >
            <span className={isRefreshing ? "inline-block animate-spin" : "inline-block"}>⟳</span>
          </button>
        </div>
        <div className="sidebar-divider" />
      </div>

      <div className="sidebar-list-scroll">
        <div className="sidebar-list">
          {invoices.map((invoice) => {
            const newIndex = newIds.get(invoice.id);
            const isNew = newIndex !== undefined;

            return (
              <div
                key={invoice.id}
                className={`invoice-list-item ${isNew ? "invoice-enter" : ""}`}
                style={isNew ? { animationDelay: `${newIndex * 90}ms` } : undefined}
              >
                <div className="overflow-hidden">
                  <InvoiceCard
                    {...invoice}
                    highlighted={selectedInvoice?.id === invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
