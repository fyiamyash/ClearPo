import { create } from "zustand";

export type InvoiceType = {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number;
  purchase_order: string | null;
  status: string;
  createdAt: string;
};

type invoiceState = {
  invoices: InvoiceType[];
  selectedInvoice: InvoiceType | null;
  setInvoice: (invoices: InvoiceType[]) => void;
  setSelectedInvoice: (invoice: InvoiceType) => void;
};

export const invoiceStore = create<invoiceState>((set) => ({
  invoices: [],
  selectedInvoice: null,
  setInvoice: (invoices) => set({ invoices }),
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
}));
