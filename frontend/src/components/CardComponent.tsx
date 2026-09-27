interface InvoiceCardProps {
  invoiceId: string;
  clientName: string;
  amount: string;
  status: string;
  highlighted?: boolean;
}

export function InvoiceCard({
  invoiceId,
  clientName,
  amount,
  status = "Making decision",
  highlighted = false,
}: InvoiceCardProps) {
  return (
    <div
      className={
        highlighted
          ? "bg-blue-50 border border-blue-100 rounded-xl px-4 py-4"
          : "rounded-xl px-4 py-4 border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-colors"
      }
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-base text-gray-900">#{invoiceId}</span>
        <span
          className={
            highlighted
              ? "text-xs font-medium uppercase tracking-wide text-blue-600"
              : "text-xs font-medium uppercase tracking-wide text-gray-400"
          }
        >
          {status}
        </span>
      </div>

      <div className="mt-2 text-base text-gray-500">{clientName}</div>

      <div className="mt-5 text-md font-medium text-gray-700">${amount}</div>
    </div>
  );
}
