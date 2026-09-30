import { useEffect, useState } from "react";
import { InvoiceDetailPanel } from "../components/DetailSection";
import { InvoiceSidebar } from "../components/SideBar";
import { useInvoice } from "../hooks/invoice";
import { invoiceStore } from "../store/invoice";

const API_ORIGIN = "http://localhost:3000";

type InvoiceDataEvent = {
  supplier_Email?: string | null;
  supplier_name?: string | null;
  invoice_number?: string | null;
  total_amount?: number | null;
  purchase_order?: string | null;
};

type PolicyEngineResult = {
  decision?: string;
  reason?: string[];
};

type CompletedFlowEvent = {
  flow?: string;
  result?: PolicyEngineResult;
};

export function HomePage() {
  const invoices = invoiceStore((s) => s.invoices);
  const selectedInvoice = invoiceStore((s) => s.selectedInvoice);
  const updateInvoice = invoiceStore((s) => s.updateInvoice);
  const { getInvoice } = useInvoice();
  const [eventName, setEventName] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    setEventName(null);
    setConnected(false);
    if (!selectedInvoice) return;

    const stream = new EventSource(`${API_ORIGIN}/timeline/${selectedInvoice.id}`);
    stream.onopen = () => setConnected(true);
    stream.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as { type?: string; data?: unknown };
        if (event.type === "invoiceEvents" && typeof event.data === "string") {
          setEventName(event.data);
          updateInvoice(selectedInvoice.id, { status: event.data });
        }
        if (event.type === "invoiceEvents" && event.data && typeof event.data === "object") {
          const data = event.data as CompletedFlowEvent;
          if (data.flow === "COMPLETED") {
            setEventName("COMPLETED");
            updateInvoice(selectedInvoice.id, {
              status: data.result?.decision ?? "COMPLETED",
              decision: data.result?.decision ?? null,
              decisionReason: data.result?.reason ?? [],
            });
          }
        }
        if (event.type === "invoiceData" && event.data) {
          const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (typeof payload === "object" && payload !== null) {
            const data = payload as InvoiceDataEvent;
            updateInvoice(selectedInvoice.id, {
              supplier_Email: data.supplier_Email,
              supplier_name: data.supplier_name,
              invoice_number: data.invoice_number,
              total_amount: data.total_amount,
              purchase_order: data.purchase_order,
            });
          }
        }
      } catch (error) {
        console.error("Unable to read invoice update", error);
      }
    };
    stream.onerror = () => setConnected(false);
    return () => stream.close();
  }, [selectedInvoice?.id, getInvoice]);

  const startFlow = async () => {
    if (!selectedInvoice || starting) return;
    setStarting(true);
    try {
      const response = await fetch(`${API_ORIGIN}/startFlow/${selectedInvoice.id}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Unable to start invoice flow");
      setEventName("INVOICE_RECEIVED");
      await getInvoice();
    } catch (error) {
      console.error(error);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <a className="app-brand" href="/" aria-label="ClearPo home">
          <span className="app-brand-mark" aria-hidden="true">
            c
          </span>
          <span className="app-brand-name">clearpo</span>
          <span className="app-brand-divider" aria-hidden="true" />
          <span className="app-brand-context">PAYABLES WORKSPACE</span>
        </a>
      </header>
      <div className="app-stage">
        <div className="app-main-row">
          <InvoiceSidebar invoices={invoices} onRefresh={getInvoice} />
          <InvoiceDetailPanel
            invoice={selectedInvoice}
            eventName={eventName}
            connected={connected}
            onStartFlow={startFlow}
            starting={starting}
          />
        </div>
      </div>
    </div>
  );
}
