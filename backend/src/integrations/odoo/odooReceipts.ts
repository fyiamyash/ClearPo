import { odooCall } from "./odooCall";

export async function getReceipts(receiptIds: number[]) {
  if (!receiptIds.length) {
    return [];
  }
  const result = await odooCall(
    "stock.picking",
    "search_read",
    [[["id", "in", receiptIds]]],
    {
      fields: [
        "id",
        "name",
        "origin",
        "state",
        "partner_id",
        "move_ids",
        "move_line_ids",
        "purchase_id",
        "date_done",
      ],
    },
  );
  return result;
}

export async function getStockRecieved(receiptIds: number[]) {
  if (!receiptIds.length) {
    return [];
  }
  const result = await odooCall(
    "stock.picking",
    "search_read",
    [[["id", "in", receiptIds]]],
    {
      fields: ["id", "product_id", "product_uom_qty", "quantity", "state"],
    },
  );
  return result;
}
