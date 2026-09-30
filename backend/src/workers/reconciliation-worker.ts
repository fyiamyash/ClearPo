import { Worker } from "bullmq";
import { connectionForBullmq, liveEventPublisher } from "../queue/connection";
import { reconciliation } from "../reconciliation/reconcile";
import type { pdfExtractedDataType } from "./pdf-extraction-worker";
import { updateInvoiceEvents } from "../invoice/updateInvoiceEvents";
import type { reconciliationQueueType } from "../queue/jobs";
import { policyEngine } from "../policyEngine/policyEngine";
import type { LlmResultType } from "../reconciliation/resultTypes";
import { updateInvoiceTable } from "../invoice/updateInvoiceTable";
import { sleep } from "bun";

export const reconciliation_Worker = new Worker(
  "reconcile",
  async (job) => {
    const invoiceDatafromReconciliationQueue: reconciliationQueueType = job.data;
    const invoiceDatafromDb: pdfExtractedDataType = invoiceDatafromReconciliationQueue.pdfData;
    const invoiceId = invoiceDatafromReconciliationQueue.invoiceId;
    await liveEventPublisher.publish(
      `invoice:${invoiceId}`,
      JSON.stringify({
        type: "invoiceEvents",
        data: "RECONCILIATION_STARTED",
      }),
    );
    updateInvoiceEvents("RECONCILIATION_STARTED", invoiceId, "SYSTEM");
    console.log("Reconciliation process started!");
    await sleep(3000);
    const resultFromReconciliation: LlmResultType = await reconciliation(
      invoiceDatafromDb,
      invoiceId,
    );
    await liveEventPublisher.publish(
      `invoice:${invoiceId}`,
      JSON.stringify({
        type: "invoiceEvents",
        data: "RECONCILIATION_COMPLETED",
      }),
    );
    updateInvoiceEvents("RECONCILIATION_COMPLETED", invoiceId, "SYSTEM");
    await liveEventPublisher.publish(
      `invoice:${invoiceId}`,
      JSON.stringify({
        type: "invoiceEvents",
        data: "MAKING_DECISION",
      }),
    );
    const policyEngineResult = policyEngine(resultFromReconciliation);
    console.log("");
    console.log("result from Policy Engine:", policyEngineResult);
    updateInvoiceTable(policyEngineResult.decision, invoiceId);
    await sleep(2500);
    await liveEventPublisher.publish(
      `invoice:${invoiceId}`,
      JSON.stringify({
        type: "invoiceEvents",
        data: {
          flow: "COMPLETED",
          result: policyEngineResult,
        },
      }),
    );
  },
  { connection: connectionForBullmq },
);

reconciliation_Worker.on("failed", (job) => {
  if (job) {
    console.error(`Reconciliation Job: ${job.id} failed!`);
  }
});
