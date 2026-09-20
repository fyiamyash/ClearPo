import { getItemDetails } from "../integrations/odoo/odooLineItems";
import { getPurchaseOrder } from "../integrations/odoo/odooPurchaseOrder";
import { getReceipts } from "../integrations/odoo/odooReceipts";
import type { incomingData } from "../integrations/odoo/odooTypes";
import type { reconciliationResult } from "./resultTypes";

export async function reconciliation(poNumber: string, vendorName?: string) {
  const data: incomingData = {
    poNumber: "P00012",
  };

  const Podetails = await getPurchaseOrder(data);
  console.log("here is the PO details", Podetails);
  const itemDetails = await getItemDetails(Podetails?.orderLineIds);
  console.log("here is the Item details", itemDetails);
  const receipts = await getReceipts(Podetails?.receiptIds);
}
