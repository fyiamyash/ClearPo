import { Job, randomUUID, Worker } from "bullmq";
import { connectionForBullmq } from "../queue/connection";
import type { emailSyncJob } from "../queue/jobs";
import { db } from "../db/db";
import { invoiceTable } from "../db/schema";
import { pdf_extraction_queue } from "../queue/all-queues";

async function syncEmailWithDb(data: emailSyncJob) {
  const invoiceId = randomUUID();
  const values: typeof invoiceTable.$inferInsert = {
    id: invoiceId,
    location: data.location,
    filename: data.fileName,
    supplier_Email: data.emailId,
  };
  const invoiceStored = await db.insert(invoiceTable).values(values);
  if (invoiceStored) {
    console.log(
      "Invoice initial details stored!, adding the details in extraction queue!",
    );
  }
  await pdf_extraction_queue.add("extract-pdf", {
    invoiceId: invoiceId,
  });
  console.log(`Job is created for extracting invoice : ${data.fileName}`);
}

export const email_worker = new Worker(
  "email-sync",
  async (job) => {
    try {
      const data: emailSyncJob = job.data;

      await syncEmailWithDb(data);
    } catch (err) {
      console.error(
        "error while inserting the pdf initail doc from email sync worker",
        err,
      );
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
