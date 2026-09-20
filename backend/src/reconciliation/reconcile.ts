import { getItemDetails } from "../integrations/odoo/odooLineItems";
import { getPurchaseOrder } from "../integrations/odoo/odooPurchaseOrder";
import { getReceipts } from "../integrations/odoo/odooReceipts";
import type { incomingData } from "../integrations/odoo/odooTypes";
import type { reconciliationResult } from "./resultTypes";

export async function reconciliation(poNumber: string, supplier?: string) {
  const data: incomingData = {
    poNumber: poNumber,
    vendor: supplier,
  };

  const Podetails = await getPurchaseOrder(data);
  console.log("here is the PO details", Podetails);
  if (!Podetails) {
    // call  agent!
  }
  const itemDetails = await getItemDetails(Podetails?.orderLineIds);
  console.log("here is the Item details", itemDetails);
  const receipts = await getReceipts(Podetails?.receiptIds);
  console.log("here is the details of recipts", receipts);
}
