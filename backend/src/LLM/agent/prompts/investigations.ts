export const missingPoPrompt = `
INVESTIGATION: MISSING PO

The invoice does not contain a PO number.

THIS CASE REQUIRES ERP INVESTIGATION.

You MUST NOT return the final reconciliation result yet.

FIRST ACTION:
Call getPurchaseOrderByVendor using the supplier name from the invoice.

Tool call:

{
  "resType": "toolcall",
  "content": {
    "toolname": "getPurchaseOrderByVendor",
    "args": {
      "supplier_name": "<supplier name from invoice>"
    }
  }
}

IMPORTANT:
- supplier_name MUST come directly from the invoice.
- Do not invent or modify the supplier name.
- Do not return REVIEW_REQUIRED before performing this ERP lookup.

After getPurchaseOrderByVendor returns:

1. Treat every returned PO as a candidate.
2. Compare the candidate supplier with the invoice supplier.
3. Compare the candidate PO total with the invoice total.
4. Eliminate candidates with clear conflicts.
5. If one candidate remains plausible, use its orderLineIds with getItemDetails.
6. Do NOT invent line IDs.
7. Only use line IDs returned by the selected ERP PO.
8. Compare product, quantity, unit price, and line total.
9. Use the selected PO's receiptIds with getReceipts when receipt verification is required.
10. Only select a PO when the ERP evidence supports it.

If multiple candidates remain plausible:
return REVIEW_REQUIRED.

If no candidate is supported:
return REVIEW_REQUIRED.

Do not return the final result until the required ERP investigation is complete.
`;
export const poMismatchPrompt = `
INVESTIGATION: PO MISMATCH

The deterministic system identified a PO mismatch.

Use getPurchaseOrderbyName to investigate the exact PO from
the invoice.

Verify:
- PO exists
- supplier
- PO total
- PO status
- order lines
- receipt IDs

Do not assume the invoice PO is correct.
Do not replace the mismatch without ERP evidence.
`;

export const itemMismatchPrompt = `
INVESTIGATION: ITEM / QUANTITY / PRICE

The deterministic system identified an item, quantity,
unit-price, or price issue.

Use getItemDetails when ERP line information is required.

Compare:
- invoice product
- ERP product
- invoice quantity
- ERP quantity
- invoice unit price
- ERP unit price
- invoice line total
- ERP line total

Only use line IDs returned by the ERP.
Never invent a line ID.

If the evidence does not resolve the discrepancy,
return REVIEW_REQUIRED.
`;

export const receiptMismatchPrompt = `
INVESTIGATION: RECEIPT

The deterministic system identified a receipt issue.

Use getReceipts only with receipt IDs returned by the
selected purchase order.

Check the receipt state.

A state of "done" means the receipt operation is completed.

Do not infer exact received quantities from state alone.
`;
