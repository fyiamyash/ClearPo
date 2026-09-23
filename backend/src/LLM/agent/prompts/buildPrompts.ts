// prompts/buildPrompt.ts

import { baseReconciliationPrompt } from "./basePrompt";
import {
  getPurchaseOrderPrompt,
  getPurchaseOrderByVendorPrompt,
  getItemDetailsPrompt,
  getReceiptsPrompt,
} from "./tools";

import {
  missingPoPrompt,
  poMismatchPrompt,
  itemMismatchPrompt,
  receiptMismatchPrompt,
} from "./investigations";
import type { reconciliationResult } from "../../../reconciliation/resultTypes";
import type { pdfExtractedDataType } from "../../../workers/pdf-extraction-worker";

export function buildReconciliationPrompt(
  result: reconciliationResult,
  invoice: pdfExtractedDataType,
) {
  const sections: string[] = [];

  sections.push(baseReconciliationPrompt);

  if (!invoice.purchase_order) {
    sections.push(getPurchaseOrderByVendorPrompt);
    sections.push(missingPoPrompt);
  } else if (!result.poMatch) {
    sections.push(getPurchaseOrderPrompt);
    sections.push(poMismatchPrompt);
  }

  if (
    !result.itemMatch ||
    !result.quantityMatch ||
    !result.lineItemUnitPrice ||
    !result.priceMatch
  ) {
    sections.push(getItemDetailsPrompt);
    sections.push(itemMismatchPrompt);
  }

  if (!result.recieptMatch) {
    sections.push(getReceiptsPrompt);
    sections.push(receiptMismatchPrompt);
  }

  return sections.join("\n\n");
}
