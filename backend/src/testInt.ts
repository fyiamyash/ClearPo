import "dotenv/config";
import { authenticateOdoo } from "./integrations/odoo/odooAuth";
import { reconciliation } from "./reconciliation/reconcile";
import { getItemDetails } from "./integrations/odoo/odooLineItems";

async function main() {
  const itemDetails = await getItemDetails([12]);
  console.log(itemDetails);
}

main().catch(console.error);
