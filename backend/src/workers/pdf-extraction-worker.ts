import { Worker } from "bullmq";

const pdf_extraction_worker = new Worker("pdf-queue", async (job) => {
  console.log(job.data);
});
