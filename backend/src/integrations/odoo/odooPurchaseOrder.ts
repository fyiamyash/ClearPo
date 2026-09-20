import { odooCall } from "./odooCall";
import type { incomingData } from "./odooTypes";

export async function getPurchaseOrder(receivedData: incomingData) {
  if (!receivedData.vendor && !receivedData.poNumber) {
    throw new Error(
      "Require atleast PO number | Vendor name to fetch PO from ERP!",
    );
  }
  if (receivedData.poNumber || (receivedData.poNumber && receivedData.vendor)) {
    try {
      const result = await odooCall("purchase.order", "search_read", [
        [["name", "=", receivedData.poNumber]],
      ]);
      return {
        purchaseOrder: result[0].name,
        supplierName_Name: result[0].partner_id[1],
        status: result[0].invoice_status,
        totalAmount: result[0].amount_total,

        orderLineIds: result[0].order_line,
        receiptIds: result[0].picking_ids,
      };
    } catch (err) {
      console.error(
        "There is some error while fetching the Po details from the Erp!",
        err,
      );
    }
  }
  if (receivedData.vendor && !receivedData.poNumber) {
    console.log("When vendor name is prresent but Po number is not ");
  }
}
