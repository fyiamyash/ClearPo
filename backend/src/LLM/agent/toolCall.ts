import { getItemDetails } from "../../integrations/odoo/odooLineItems";
import {
  getPurchaseOrder,
  getPurchaseOrderByVendor,
} from "../../integrations/odoo/odooPurchaseOrder";
import { getReceipts } from "../../integrations/odoo/odooReceipts";

export type toolname =
  | "getPurchaseOrder"
  | "getPurchaseOrderByVendor"
  | "getItemDetails"
  | "getReceipts";

// export async function toolCall(toolName: toolname, arg: any) {
//   console.log(toolName, arg);

//   if (toolName == "getPurchaseOrderByVendor") {
//     console.log("getPurchaseOrderByVendor called");
//     const result = await getPurchaseOrderByVendor(arg);
//     return result;
//   } else if (toolName == "getPurchaseOrder") {
//     console.log("getPurchaseOrder called");
//     const result = await getPurchaseOrder(arg);
//     return result;
//   } else if (toolName == "getItemDetails") {
//     console.log("getItemDetails called");
//     const result = await getItemDetails(arg);
//     return result;
//   } else if ((toolName = "getReceipts")) {
//     console.log("getReceipts called");
//     const result = await getReceipts(arg);
//     return result;
//   } else {
//     return "No tool present for this toolname";
//   }
// }

export async function toolCall(toolName: toolname, args: Record<string, any>) {
  switch (toolName) {
    case "getPurchaseOrder":
      return await getPurchaseOrder(args);

    case "getPurchaseOrderByVendor":
      return await getPurchaseOrderByVendor(args.supplier_name);

    case "getItemDetails":
      return await getItemDetails(args.lineIds);

    case "getReceipts":
      return await getReceipts(args.receiptIds);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
