import "dotenv/config";
import { authenticateOdoo } from "./integrations/odoo/client";

async function main() {
  const uuid = await authenticateOdoo();
  console.log("Odoo UID:", uuid);
}

main().catch(console.error);
