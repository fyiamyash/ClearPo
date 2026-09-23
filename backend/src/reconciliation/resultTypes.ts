export type reconciliationResult = {
  poMatch: boolean;
  supplierMatch: boolean;
  itemMatch: boolean;
  quantityMatch: boolean;
  lineItemUnitPrice: boolean;
  priceMatch: boolean;
  recieptMatch: boolean;
  ispaid: boolean;
  agent_call_required: boolean;
  reason: string[];
  decision: "REVIEW_REQUIRED" | "BLOCKED" | "READY_FOR_PAYMENT";
};

export type lineItemType = {
  id: number;
  product_id: any[];
  name: string;
  product_qty: number;
  qty_received: number;
  price_unit: number;
  price_subtotal: number;
  price_total: number;
};
