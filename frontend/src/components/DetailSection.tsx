import { useEffect, useState, type CSSProperties } from "react";
import type { InvoiceType } from "../store/invoice";

const journeySteps = [
  { title: "Email received", detail: "Message and attachment arrived safely.", icon: "↓" },
  { title: "Extracting PDF", detail: "Reading totals, dates and line items.", icon: "▤" },
  { title: "Making decision", detail: "Matching policy, vendor and purchase order.", icon: "✧" },
  { title: "Reconciling", detail: "Preparing the final account match.", icon: "⚖︎" },
  { title: "Flow completed", detail: "Ready for payment and archive.", icon: "$" },
];

const journeyPositions = [
  { node: [8.04, 15.38], label: [12.5, 10.5], align: "left" },
  { node: [32.61, 41.54], label: [36.5, 36.5], align: "left" },
  { node: [58.7, 24.04], label: [62.3, 18.5], align: "left" },
  { node: [73.91, 64.81], label: [77.5, 59.5], align: "left" },
  { node: [92.39, 85.96], label: [72, 79], align: "left" },
] as const;

const journeyPath = "M74 80 C 208 80, 125 216, 300 216 S 477 82, 540 125 S 482 358, 680 337 S 728 454, 850 447";

const eventStage: Record<string, number> = {
  INVOICE_RECEIVED: 1,
  EXTRACTING_PDF: 1,
  EXTRACTION_STARTED: 1,
  EXTRACTION_COMPLETED: 2,
  RECONCILIATION_STARTED: 2,
  DETERMINISTIC_FLOW_STARTED: 2,
  DETERMINISTIC_FLOW_COMPLETED: 3,
  RUNNING_AGENT: 2,
  AGENT_INVESTIGATION_COMPLETED: 3,
  RECONCILIATION_COMPLETED: 3,
  MAKING_DECISION: 2,
  COMPLETED: 5,
};

function currentStage(invoice: InvoiceType, eventName: string | null) {
  if (["BLOCKED", "REVIEW_REQUIRED", "READY_FOR_PAYMENT", "PAID"].includes(invoice.status ?? "")) return 5;
  if (eventName && eventStage[eventName] !== undefined) return eventStage[eventName];
  if (invoice.status === "RECONCILING") return 2;
  return -1;
}

function RevealingValue({ value, className = "" }: { value: string; className?: string }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (!value) {
      setVisibleText("");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleText(value);
      return;
    }

    setVisibleText("");
    let character = 0;
    const timer = window.setInterval(() => {
      character += 1;
      setVisibleText(value.slice(0, character));
      if (character >= value.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <span className={className} aria-label={value || undefined}>
      {value ? <span className="value-reveal">{visibleText}</span> : <span className="value-skeleton" aria-label="Waiting for invoice details" />}
    </span>
  );
}

function Journey({ invoice, eventName, connected }: { invoice: InvoiceType; eventName: string | null; connected: boolean }) {
  const activeStage = currentStage(invoice, eventName);
  const [pathAnimating, setPathAnimating] = useState(true);
  const pathProgress = Math.min(100, Math.max(0, activeStage) * 25);
  const needsReview = Boolean(
    eventName?.includes("FAILED") ||
      ["FAILED", "BLOCKED", "REVIEW_REQUIRED"].includes(invoice.status ?? ""),
  );

  return (
    <section className="journey-section" aria-label="Invoice processing journey">
      <div className="journey-heading">
        <div>
          <div className="eyebrow">Processing journey</div>
          <p className="journey-caption">A live view of each step in this invoice’s review.</p>
        </div>
        <div className={`stream-state ${connected ? "is-connected" : ""}`} aria-live="polite">
          <span className="stream-dot" />
          {connected ? "Live updates" : "Connecting to updates"}
        </div>
      </div>

      <div className="journey-canvas">
        <svg className="journey-path" viewBox="0 0 920 520" preserveAspectRatio="none" aria-hidden="true">
          <path className="path-future" d={journeyPath} />
          <path
            className={`path-complete ${pathAnimating ? "is-entering" : ""}`}
            d={journeyPath}
            pathLength="100"
            style={{ strokeDashoffset: 100 - pathProgress, "--path-target": 100 - pathProgress } as CSSProperties}
            onAnimationEnd={() => setPathAnimating(false)}
          />
        </svg>
        <ol className="journey-steps">
          {journeySteps.map((step, index) => {
            const complete = activeStage > index;
            const active = !needsReview && activeStage === index;
            const needsAttention = needsReview && activeStage === index;
            const state = needsAttention ? "needs-attention" : complete ? "complete" : active ? "active" : "upcoming";
            const lineComplete = index < activeStage && index < journeySteps.length - 1;
            const number = String(index + 1).padStart(2, "0");
            const detail = invoice.status === "BLOCKED" && index === journeySteps.length - 1
              ? "Review complete. Payment is blocked."
              : step.detail;
            const position = journeyPositions[index];

            return (
              <li className={`journey-step ${state} ${lineComplete ? "line-complete" : ""}`} key={step.title}>
                <span
                  className="step-node"
                  style={{ left: `${position.node[0]}%`, top: `${position.node[1]}%` }}
                  aria-hidden="true"
                >
                  {complete ? "✓" : needsAttention ? "!" : step.icon}
                </span>
                <div
                  className={`step-content align-${position.align}`}
                  style={{ left: `${position.label[0]}%`, top: `${position.label[1]}%` }}
                >
                  <div className="step-meta">
                    <span className="step-number">{number}</span>
                    <span className="step-status">
                      {complete ? "Complete" : active ? "In progress" : needsAttention ? "Needs attention" : index === 2 ? "Now" : index === 3 ? "Next" : index === 4 ? "Later" : "Up next"}
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{needsAttention ? "This step needs a closer look before processing can continue." : detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function InvoiceDetailPanel({
  invoice,
  eventName,
  connected,
  onStartFlow,
  starting,
}: {
  invoice: InvoiceType | null;
  eventName: string | null;
  connected: boolean;
  onStartFlow: () => void;
  starting: boolean;
}) {
  if (!invoice) {
    return (
      <main className="detail-panel empty-detail">
        <h1>Select an invoice</h1>
        <p>Choose an invoice from your inbox to follow its progress.</p>
      </main>
    );
  }

  const hasExtractedDetails = Boolean(invoice.supplier_name || invoice.invoice_number);
  const formattedDate = hasExtractedDetails && invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "";
  const amount = invoice.total_amount != null ? `$${invoice.total_amount.toLocaleString("en-US")}` : "";
  const notStarted = !invoice.status || ["RECEIVED", "NOT_STARTED"].includes(invoice.status);
  const statusLabel = invoice.status
    ?.toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "";
  const isBlocked = invoice.status === "BLOCKED";

  return (
    <main className="detail-panel">
      <header className="invoice-header">
        <div className="invoice-identity">
          <div className="eyebrow">Current invoice</div>
          <h1><RevealingValue value={invoice.supplier_name?.trim() || ""} /></h1>
          <p className="invoice-reference">
            <RevealingValue value={invoice.invoice_number ? `#${invoice.invoice_number}` : ""} />
            <span className="reference-dot">·</span>
            <RevealingValue value={amount} />
          </p>
        </div>

        <div className="invoice-facts">
          <div className="invoice-fact">
            <span className="eyebrow">Received</span>
            <RevealingValue value={formattedDate} className="fact-value" />
          </div>
          <div className="invoice-fact">
            <span className="eyebrow">Purchase order</span>
            <RevealingValue value={invoice.purchase_order || ""} className="fact-value" />
          </div>
          <button
            className={`start-flow-button ${notStarted ? "" : `is-status ${isBlocked ? "is-blocked" : ""}`}`}
            type="button"
            onClick={onStartFlow}
            disabled={starting || !notStarted}
          >
            <span aria-hidden="true">{starting ? "◌" : notStarted ? "↗" : isBlocked ? "!" : "✓"}</span>
            {starting ? "Starting flow" : notStarted ? "Start flow" : statusLabel}
          </button>
        </div>
      </header>

      <Journey invoice={invoice} eventName={eventName} connected={connected} />
    </main>
  );
}
