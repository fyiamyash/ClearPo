import "dotenv/config";
import { authenticateOdoo } from "./integrations/odoo/odooAuth";
import { reconciliation } from "./reconciliation/reconcile";
import { getItemDetails } from "./integrations/odoo/odooLineItems";
import { agentLoop } from "./LLM/agent/agentLoop";
import type { reconciliationResult } from "./reconciliation/resultTypes";
import { getPurchaseOrder } from "./integrations/odoo/odooPurchaseOrder";
import {
  createBill,
  getVendorBills,
  payVendorBill,
  postBill,
} from "./integrations/odoo/odooReceipts";

async function main() {
  // const itemDetails = await getItemDetails([12]);
  // console.log(itemDetails);
  const result = await postBill("2026-09-25", "P00009");

  const paid = await payVendorBill(result.id, result.amount_residual);
  console.log(paid);
}

main().catch(console.error);
