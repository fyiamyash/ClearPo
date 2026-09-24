export type invoiceEvent =
  | "INVOICE_RECEIVED"
  | "EXTRACTION_STARTED"
  | "EXTRACTION_COMPLETED"
  | "EXTRACTION_FAILED"
  | "RECONCILIATION_STARTED"
  | "DETERMINISTIC_RECONCILIATION_COMPLETED"
  | "AGENT_INVESTIGATION_STARTED"
  | "RECONCILIATION_COMPLETED";

export type humanReviewType = {
  invoiceId: string;
  decision: string;
  reviewer: string;
  reason: string;
  createdAt: Date;
  resolvedAt: Date;
};

export type agentTableType = {
  invoiceId: string;
  reconcileId: string;
  startedAt: Date;
  completedAt: Date;
  result: string;
};
