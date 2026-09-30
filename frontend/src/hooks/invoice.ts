import { useCallback, useEffect } from "react";
import { invoiceStore } from "../store/invoice";

export type Invoice = {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  purchase_order: string | null;
  status: string | null;
  createdAt: string;
};

export function useInvoice() {
  const setInvoice = invoiceStore((s) => s.setInvoice);

  const getInvoice = useCallback(async () => {
    const resp = await fetch("http://localhost:3000/invoice");
    if (!resp.ok) {
      throw new Error("Unable to get invoices");
    }
    const data: Invoice[] = await resp.json();
    setInvoice(data);
  }, [setInvoice]);

  useEffect(() => {
    void getInvoice().catch((error) => {
      console.error("Unable to load invoices", error);
    });
  }, [getInvoice]);

  return { getInvoice };
}
