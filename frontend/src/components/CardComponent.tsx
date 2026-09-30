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
  const isNew = !invoice_number && !supplier_name;
  const displayName = isNew ? "New invoice received" : `#${invoice_number}`;
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
      <span className="invoice-card-supplier">{isNew ? supplier_Email || "Unknown sender" : supplier_name}</span>
      {!isNew && total_amount != null && (
        <span className="invoice-card-amount">${total_amount.toLocaleString("en-US")}</span>
      )}
    </button>
  );
}
