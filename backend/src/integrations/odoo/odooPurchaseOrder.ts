import { odooCall } from "./odooCall";
import type { incomingData } from "./odooTypes";

export async function getPurchaseOrder(receivedData: incomingData) {
  try {
    const result = await odooCall("purchase.order", "search_read", [
      [["name", "=", receivedData.poNumber]],
    ]);

    return {
      id: result[0].id,
      purchaseOrder: result[0].name,
      supplierName_Name: result[0].partner_id[1],
      status: result[0].invoice_status,
      totalAmount: result[0].amount_total,

      orderLineIds: result[0].order_line,
      receiptIds: result[0].picking_ids,
      invoiceIds: result[0].invoice_ids,
    };
  } catch (err) {
    console.error("There is some error while fetching the Po details from the Erp!", err);
  }
}

export async function getPurchaseOrderByVendor(vendorName: string) {
  try {
    const result = await odooCall(
      "purchase.order",
      "search_read",
      [[["partner_id.name", "=", vendorName]]],
      {
        fields: [
          "name",
          "partner_id",
          "partner_ref",
          "state",
          "invoice_status",
          "amount_total",
          "order_line",
          "picking_ids",
        ],
        limit: 20,
      },
    );

    if (!result.length) {
      return [];
    }

    return result.map((po: any) => ({
      purchaseOrder: po.name,
      supplierName_Name: po.partner_id?.[1],
      vendorReference: po.partner_ref,
      status: po.state,
      invoiceStatus: po.invoice_status,
      totalAmount: po.amount_total,
      orderLineIds: po.order_line,
      receiptIds: po.picking_ids,
      invoiceIds: po.invoice_ids,
    }));
  } catch (err) {
    console.error("There is some error while fetching POs by vendor name from the ERP!", err);

    throw err;
  }
}
