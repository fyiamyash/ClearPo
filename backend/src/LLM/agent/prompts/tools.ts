export const getPurchaseOrderPrompt = `
TOOL: getPurchaseOrder

Purpose:
Fetch purchase order information from the ERP.

Use it when you need:
- PO supplier
- PO total
- PO status
- PO line IDs
- receipt/picking IDs
- supplier reference

Only use data returned by the ERP.
`;

export const getPurchaseOrderByVendorPrompt = `
TOOL: getPurchaseOrderByVendor

Purpose:
Find purchase orders belonging to the invoice supplier.

Arguments:
{
  "supplier_name": string
}

CRITICAL ARGUMENT RULE:

The value of supplier_name MUST be copied from the
invoice field named "supplier_name".

DO NOT copy the value from "supplier_Email".

The invoice contains TWO different supplier fields:

supplier_name = company/vendor name
supplier_Email = supplier email address

These fields are NOT interchangeable.

Example invoice:

{
  "supplier_Email": "billing@sunrisestationery.example",
  "supplier_name": "Sunrise Stationery & Supplies"
}

The correct tool call is:

{
  "resType": "toolcall",
  "content": {
    "toolname": "getPurchaseOrderByVendor",
    "args": {
      "supplier_name": "Sunrise Stationery & Supplies"
    }
  }
}

The following is WRONG:

{
  "resType": "toolcall",
  "content": {
    "toolname": "getPurchaseOrderByVendor",
    "args": {
      "supplier_name": "billing@sunrisestationery.example"
    }
  }
}

NEVER use supplier_Email as supplier_name.

WHEN TO USE:

Use this tool when the invoice does not contain a purchase order number.

If the invoice has no PO number, this tool is the FIRST ERP TOOL
that must be called.

After the tool returns:

1. Treat every returned PO as a candidate.
2. Compare the candidates against the invoice.
3. Eliminate candidates that clearly conflict.
4. Use getItemDetails only for remaining candidates.
5. Never invent PO IDs, orderLineIds, or receiptIds.
`;
export const getItemDetailsPrompt = `
TOOL: getItemDetails

Purpose:
Fetch purchase order line-item details.

Arguments:
{
  "lineIds": number[]
}

IMPORTANT:
lineIds MUST come directly from an ERP purchase-order result.

Never invent line IDs.

Use the result to compare:
- product
- quantity
- unit price
- line total
- received quantity
`;

export const getReceiptsPrompt = `
TOOL: getReceipts

Purpose:
Fetch receipt information associated with a purchase order.

Arguments:
{
  "receiptIds": number[]
}

IMPORTANT:
receiptIds MUST come directly from the selected ERP purchase order.

Never invent receipt IDs.

A receipt with state "done" means the receipt operation is completed.

Do not infer exact received quantities from receipt state alone.
`;
