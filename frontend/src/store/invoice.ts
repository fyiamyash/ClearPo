import { create } from "zustand";

export type InvoiceType = {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  purchase_order: string | null;
  status: string | null;
  createdAt: string;
  decision?: string | null;
  decisionReason?: string[] | null;
};

type invoiceState = {
  invoices: InvoiceType[];
  selectedInvoice: InvoiceType | null;
  setInvoice: (invoices: InvoiceType[]) => void;
  setSelectedInvoice: (invoice: InvoiceType) => void;
  updateInvoice: (id: string, patch: Partial<Omit<InvoiceType, "id">>) => void;
};

export const invoiceStore = create<invoiceState>((set) => ({
  invoices: [],
  selectedInvoice: null,
  setInvoice: (invoices) => set((state) => {
    const mergedInvoices = invoices.map((invoice) => {
      const existing = state.invoices.find((item) => item.id === invoice.id);
      if (!existing) return invoice;
      return {
        ...existing,
        ...invoice,
        supplier_Email: invoice.supplier_Email ?? existing.supplier_Email,
        supplier_name: invoice.supplier_name ?? existing.supplier_name,
        invoice_number: invoice.invoice_number ?? existing.invoice_number,
        total_amount: invoice.total_amount ?? existing.total_amount,
        purchase_order: invoice.purchase_order ?? existing.purchase_order,
      };
    });
    if (!state.selectedInvoice) return { invoices: mergedInvoices };
    const refreshed = mergedInvoices.find((invoice) => invoice.id === state.selectedInvoice?.id);
    return {
      invoices: mergedInvoices,
      selectedInvoice: refreshed
        ? {
            ...state.selectedInvoice,
            ...refreshed,
            supplier_Email: refreshed.supplier_Email ?? state.selectedInvoice.supplier_Email,
            supplier_name: refreshed.supplier_name ?? state.selectedInvoice.supplier_name,
            invoice_number: refreshed.invoice_number ?? state.selectedInvoice.invoice_number,
            total_amount: refreshed.total_amount ?? state.selectedInvoice.total_amount,
            purchase_order: refreshed.purchase_order ?? state.selectedInvoice.purchase_order,
          }
        : state.selectedInvoice,
    };
  }),
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
  updateInvoice: (id, patch) => set((state) => {
    const existing = state.invoices.find((invoice) => invoice.id === id) ??
      (state.selectedInvoice?.id === id ? state.selectedInvoice : null);
    if (!existing) return state;

    const updated = { ...existing, ...patch };
    return {
      invoices: state.invoices.map((invoice) => invoice.id === id ? updated : invoice),
      selectedInvoice: state.selectedInvoice?.id === id ? updated : state.selectedInvoice,
    };
  }),
}));
