import { getItemDetails } from "../integrations/odoo/odooLineItems";
import { getPurchaseOrder } from "../integrations/odoo/odooPurchaseOrder";
import { getReceipts, getVendorBills } from "../integrations/odoo/odooReceipts";
import type { bills, incomingData, receiptType } from "../integrations/odoo/odooTypes";
import type { pdfExtractedDataType } from "../workers/pdf-extraction-worker";
import type { lineItemType, reconciliationResult } from "./resultTypes";

export async function deterministicFlow(
  invoiceData: pdfExtractedDataType,
): Promise<reconciliationResult> {
  console.log("pdf data in the deterministic flow", invoiceData);
  console.log(invoiceData.supplier_name);
  const data: incomingData = {
    poNumber: invoiceData.purchase_order,
    vendor: invoiceData.supplier_name,
  };
  console.log("deterministic flow started");
  const result: reconciliationResult = {
    poMatch: false,
    supplierMatch: false,
    itemMatch: false,
    quantityMatch: false,
    lineItemUnitPrice: false,
    priceMatch: false,
    ispaid: false,
    recieptMatch: false,

    agent_call_required: false,
    reason: [],
    decision: "REVIEW_REQUIRED",
  };
  if (!data.poNumber) {
    result.agent_call_required = true;
    result.reason.push("Purchase order number(PO) not found in data extracted from PDF received!");
    console.log("deterministic flow completed");
    return result;
  }
  const Podetails = await getPurchaseOrder(data);
  if (!Podetails) {
    result.agent_call_required = true;
    result.reason.push("Purchase order number(PO) not found in the ERP databse");
    console.log("deterministic flow completed");
    return result;
  }
  if (Podetails.purchaseOrder !== invoiceData.purchase_order) {
    result.reason.push("PO number does not match!");
  } else {
    result.poMatch = true;
  }

  // checking for duplicate:
  const paidPo: bills[] = await getVendorBills(Podetails.invoiceIds);
  if (paidPo) {
    const paid = paidPo.every((bill) => bill.payment_state === "paid");
    if (paid) {
      result.ispaid = true;
      result.reason.push("This Purchase order(PO) is already paid!");
      result.decision = "BLOCKED";
      return result;
    }
  }

  //checking total_amount:

  if (Podetails.totalAmount !== invoiceData.total_amount) {
    result.reason.push("Total amount does not match!");
  } else {
    result.priceMatch = true;
  }

  // supplier match:

  if (Podetails.supplierName_Name !== invoiceData.supplier_name) {
    result.reason.push("Supplier / vendor doesnt match");
    result.agent_call_required = true;
  } else {
    result.supplierMatch = true;
  }

  const itemDetails: lineItemType[] = await getItemDetails(Podetails.orderLineIds);
  // checking items
  if (itemDetails.length !== invoiceData.lineItems.length) {
    result.reason.push("Line item quantity mismatch");
  } else {
    for (let i = 0; i < invoiceData.lineItems.length; i++) {
      const product = itemDetails.find((u) => u.name === invoiceData.lineItems[i]!.product);
      if (product && invoiceData.lineItems[i]) {
        result.itemMatch = true;
        if (product.product_qty !== invoiceData.lineItems[i]!.quantity) {
          result.reason.push("one of the line item's quantity doesnot match");
        } else {
          result.quantityMatch = true;
        }
        if (product.price_unit !== invoiceData.lineItems[i]!.unit_price) {
          result.reason.push("one of the line item's unit price does not match");
        } else {
          result.lineItemUnitPrice = true;
        }
      }
    }
  }

  const receipts: receiptType[] = await getReceipts(Podetails?.receiptIds);
  result.recieptMatch = receipts.every((element) => {
    return element.state == "done";
  });

  if (!result.recieptMatch) {
    result.reason.push("All the items are not delivered");
  }
  if (
    result.poMatch &&
    result.supplierMatch &&
    result.itemMatch &&
    result.quantityMatch &&
    result.lineItemUnitPrice &&
    result.priceMatch &&
    result.recieptMatch
  ) {
    result.decision = "READY_FOR_PAYMENT";
  }
  console.log("deterministic flow completed");
  return result;
}
