import { Queue } from "bullmq";

export const email_sync_queue = new Queue("email-sync");
export const pdf_extract_queue = new Queue("pdf-queue");
export const reconciliation_queue = new Queue("reconcile");
