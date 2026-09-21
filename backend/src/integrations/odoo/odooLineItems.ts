import { odooCall } from "./odooCall";

export async function getItemDetails(lineIds: number[]) {
  if (!lineIds.length) {
    return [];
  }
  try {
    const result = await odooCall("purchase.order.line", "search_read", [[["id", "in", lineIds]]], {
      fields: [
        "id",
        "product_id",
        "name",
        "product_qty",
        "qty_received",
        "price_unit",
        "price_subtotal",
        "price_total",
      ],
      limit: 100,
    });
    return result;
  } catch (err) {
    console.error("There is some error while fetching the item details from ERP", err);
    return;
  }
}
