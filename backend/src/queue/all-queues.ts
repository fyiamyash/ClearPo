import { Queue } from "bullmq";
import { connectionForBullmq } from "./connection";
import type { emailSyncJob } from "./jobs";

export const email_sync_queue = new Queue<emailSyncJob>("email-sync", {
  connection: connectionForBullmq,
  defaultJobOptions: {
    removeOnComplete: {
      age: 60,
      count: 10,
    },
    removeOnFail: {
      age: 60,
    },
  },
});

export const pdf_extraction_queue = new Queue("pdf-queue", {
  connection: connectionForBullmq,
  defaultJobOptions: {
    removeOnComplete: {
      age: 60,
      count: 10,
    },
    removeOnFail: {
      age: 60,
    },
  },
});

export const reconciliation_queue = new Queue("reconcile", {
  connection: connectionForBullmq,
  defaultJobOptions: {
    removeOnComplete: {
      age: 60,
      count: 10,
    },
    removeOnFail: {
      age: 60,
    },
  },
});
