interface InvoiceCardProps {
  id: string;
  supplier_Email: string | null;
  supplier_name: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  purchase_order: string | null;
  status: string | null;
  createdAt: string;
  highlighted: boolean;
  onClick: () => void;
}

export function InvoiceCard({
  invoice_number,
  supplier_name,
  total_amount,
  highlighted,
  supplier_Email,
  status,
  onClick,
}: InvoiceCardProps) {
  const displayName = invoice_number ? `#${invoice_number}` : supplier_name || "New invoice received";
  const secondary = invoice_number
    ? supplier_name || supplier_Email || "Supplier details pending"
    : supplier_name
      ? supplier_Email || "Invoice number pending"
      : supplier_Email || "Details pending";
  const displayStatus = status?.replaceAll("_", " ") || "Not started";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={highlighted}
      className={`invoice-card ${highlighted ? "is-selected" : ""}`}
    >
      <span className="invoice-card-topline">
        <span className="invoice-card-number">{displayName}</span>
        <span className={`invoice-status ${highlighted ? "is-selected" : ""}`}>{displayStatus}</span>
      </span>
      <span className="invoice-card-supplier">{secondary}</span>
      {total_amount != null && (
        <span className="invoice-card-amount">${total_amount.toLocaleString("en-US")}</span>
      )}
    </button>
  );
}
