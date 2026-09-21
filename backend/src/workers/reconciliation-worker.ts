import { Worker } from "bullmq";
import { connectionForBullmq } from "../queue/connection";
import { reconciliation } from "../reconciliation/reconcile";
import type { pdfExtractedDataType } from "./pdf-extraction-worker";

export const reconciliation_Worker = new Worker(
  "reconcile",
  async (job) => {
    const invoiceDatafromDb: pdfExtractedDataType = job.data;
    console.log("Reconciliation process started!");
    const resultFromReconciliation = await reconciliation(invoiceDatafromDb);
  },
  { connection: connectionForBullmq },
);

reconciliation_Worker.on("failed", (job) => {
  if (job) {
    console.error(`Reconciliation Job: ${job.id} failed!`);
  }
});
