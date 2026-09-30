import { Job, randomUUID, Worker } from "bullmq";
import { connectionForBullmq, liveEventPublisher } from "../queue/connection";
import type { emailSyncJob } from "../queue/jobs";
import { db } from "../db/db";
import { invoiceTable } from "../db/schema";
import { updateInvoiceEvents } from "../invoice/updateInvoiceEvents";

async function syncEmailWithDb(data: emailSyncJob) {
  const invoiceId = randomUUID();
  const values: typeof invoiceTable.$inferInsert = {
    id: invoiceId,
    location: data.location,
    filename: data.fileName,
    supplier_Email: data.emailId,
    fileSize: data.size,
  };
  const invoiceStored = await db.insert(invoiceTable).values(values);
  if (invoiceStored) {
    console.log("Invoice initial details stored!");
  }
  await liveEventPublisher.publish(
    `invoice:${invoiceId}`,
    JSON.stringify({
      type: "invoiceEvents",
      data: "INVOICE_RECEIVED",
    }),
  );
  updateInvoiceEvents("INVOICE_RECEIVED", invoiceId, "SYSTEM");
}

export const email_worker = new Worker(
  "email-sync",
  async (job) => {
    try {
      const data: emailSyncJob = job.data;

      await syncEmailWithDb(data);
    } catch (err) {
      console.error("error while inserting the pdf initail doc from email sync worker", err);
    }
  },
  { connection: connectionForBullmq },
);

email_worker.on("completed", (Job) => {
  console.log(`eamil-sync operation with job id: ${Job.id} is completed`);
});

email_worker.on("failed", (Job, err: Error) => {
  if (!Job) {
    return;
  }
  console.log(`Email job${Job.id} is failed ${err}`);
});
