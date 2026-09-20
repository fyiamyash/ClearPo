import "dotenv/config";
import { authenticateOdoo } from "./integrations/odoo/odooAuth";
import { reconciliation } from "./reconciliation/reconcile";

async function main() {
  reconciliation("P00012");
}

main().catch(console.error);
