import type { LlmResultType, reconciliationResult } from "../reconciliation/resultTypes";
import type { PolicyDecision } from "./types";

export function policyEngine(resultFromReconciliation: LlmResultType): PolicyDecision {
  const poMatch = resultFromReconciliation.poMatch;
  const supplierMatch = resultFromReconciliation.supplierMatch;
  const itemMatch = resultFromReconciliation.itemMatch;
  const quantityMatch = resultFromReconciliation.quantityMatch;
  const lineItemUnitPrice = resultFromReconciliation.lineItemUnitPrice;
  const priceMatch = resultFromReconciliation.priceMatch;
  const recieptMatch = resultFromReconciliation.recieptMatch;
  const ispaid = resultFromReconciliation.ispaid;

  if (ispaid) {
    return {
      decision: "BLOCKED",
      reason: ["Invoice has already been paid."],
    };
  }

  if (!poMatch) {
    return {
      decision: "BLOCKED",
      reason: ["Purchase order could not be verified."],
    };
  }

  if (!supplierMatch) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Supplier does not match the purchase order."],
    };
  }

  if (!itemMatch) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Invoice item does not match the purchase order."],
    };
  }

  if (!quantityMatch) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Invoice quantity does not match the purchase order."],
    };
  }

  if (!lineItemUnitPrice) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Invoice unit price does not match the purchase order."],
    };
  }

  if (!priceMatch) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Invoice total amount does not match the purchase order."],
    };
  }

  if (!recieptMatch) {
    return {
      decision: "REVIEW_REQUIRED",
      reason: ["Goods receipt could not be verified."],
    };
  }

  return {
    decision: "READY_FOR_PAYMENT",
    reason: ["All required reconciliation checks passed."],
  };
}
