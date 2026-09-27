interface InvoiceCardProps {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number;
  purchase_order: string | null;
  status: string;
  createdAt: string;
  highlighted: boolean;
  onClick: () => void;
}

export function InvoiceCard({
  invoice_number,
  supplier_name,
  total_amount,
  highlighted,
  status,
  onClick,
}: InvoiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={
        highlighted
          ? "bg-blue-50 border border-blue-100 rounded-xl px-4 py-4"
          : "rounded-xl px-4 py-4 border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-colors"
      }
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-base text-gray-900">#{invoice_number}</span>
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

      <div className="mt-2 text-base text-gray-500">{supplier_name}</div>

      <div className="mt-5 text-md font-medium text-gray-700">${total_amount}</div>
    </div>
  );
}
