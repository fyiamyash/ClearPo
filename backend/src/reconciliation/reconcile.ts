import { getItemDetails } from "../integrations/odoo/odooLineItems";
import { getPurchaseOrder } from "../integrations/odoo/odooPurchaseOrder";
import { getReceipts } from "../integrations/odoo/odooReceipts";
import type { incomingData } from "../integrations/odoo/odooTypes";
import { agentLoop } from "../LLM/agent/agentLoop";
import type { pdfExtractedDataType } from "../workers/pdf-extraction-worker";
import { deterministicFlow } from "./deterministicFlow";
import type { reconciliationResult } from "./resultTypes";

export async function reconciliation(incomingDataFromPdfJob: pdfExtractedDataType) {
  const resulFromDeterministicFLow = await deterministicFlow(incomingDataFromPdfJob);
  console.log("result from deterministic flow:", resulFromDeterministicFLow);
  if (resulFromDeterministicFLow.agent_call_required) {
    const resultFromAgent = agentLoop(resulFromDeterministicFLow, incomingDataFromPdfJob);
  }
}
