import "dotenv/config";
import { authenticateOdoo } from "./integrations/odoo/odooAuth";
import { reconciliation } from "./reconciliation/reconcile";
import { getItemDetails } from "./integrations/odoo/odooLineItems";
import { agentLoop } from "./LLM/agent/agentLoop";
import type { reconciliationResult } from "./reconciliation/resultTypes";

async function main() {
  // const itemDetails = await getItemDetails([12]);
  // console.log(itemDetails);
  const result: reconciliationResult = {
    poMatch: false,
    supplierMatch: false,
    itemMatch: false,
    quantityMatch: false,
    lineItemUnitPrice: false,
    priceMatch: false,
    recieptMatch: false,

    agent_call_required: false,
    reason: [],
    decision: "REVIEW_REQUIRED",
  };
}

main().catch(console.error);
