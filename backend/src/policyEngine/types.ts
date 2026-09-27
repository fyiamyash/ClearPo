export type PolicyDecision = {
  decision: "REVIEW_REQUIRED" | "BLOCKED" | "READY_FOR_PAYMENT";

  reason: string[];
};
