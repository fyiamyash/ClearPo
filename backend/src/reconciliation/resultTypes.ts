export type reconciliationResult = {
  poMatch: boolean;
  supplierMatch: boolean;
  itemMatch: boolean;
  quantityMatch: boolean;
  priceMatch: boolean;
  recieptMatch: boolean;
  allcheckPassed: boolean;
  decision: "REVIEW_REQUIRED" | "BLOCKED" | "READY_FOR_PAYMENT";
};
