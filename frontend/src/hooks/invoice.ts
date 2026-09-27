import { useEffect } from "react";
import { invoiceStore } from "../store/invoice";

export type Invoice = {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number;
  purchase_order: string | null;
  status: string;
  createdAt: string;
};

export function useInvoice() {
  const setInvoice = invoiceStore((s) => s.setInvoice);
  useEffect(() => {
    async function getInvoice() {
      const resp = await fetch("http://localhost:3000/invoice");
      if (!resp.ok) {
        throw new Error("Unable to get invoices");
      }
      const data: Invoice[] = await resp.json();
      setInvoice(data);
    }
    getInvoice();
  }, []);
}
