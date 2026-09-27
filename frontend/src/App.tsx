import "./App.css";
import { InvoiceDetailPanel } from "./components/DetailSection";
import { InvoiceSidebar } from "./components/SideBar";

function App() {
  const invoices = [
    {
      invoiceId: "INV-8821",
      clientName: "Aurelius Paper Co.",
      amount: "4,290.00",
      status: "Making decision",
    },
    {
      invoiceId: "INV-8819",
      clientName: "Nordic Design Lab",
      amount: "1,120.50",
      status: "Flow completed",
    },
    {
      invoiceId: "INV-8818",
      clientName: "Fjord Logistics",
      amount: "840.00",
      status: "Extracting PDF",
    },
    {
      invoiceId: "INV-8815",
      clientName: "Solstice Agency",
      amount: "12,400.00",
      status: "Email received",
    },
    {
      invoiceId: "INV-8812",
      clientName: "Quiet Form Studio",
      amount: "2,050.00",
      status: "Reconciling",
    },
  ];
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <InvoiceSidebar invoices={invoices} />
      <InvoiceDetailPanel
        invoiceId="skadgf"
        clientName="Sunrise company"
        amount="14230"
        receivedDate="29-06-26"
        accountRouting="finance"
      />
    </div>
  );
}

export default App;
