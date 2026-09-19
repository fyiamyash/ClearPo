import { Worker } from "bullmq";
import { open } from "node:fs/promises";
import { connectionForBullmq } from "../queue/connection";
import type { pdfExtraction } from "../queue/jobs";
import { llm_call_for_pdfExtraction } from "../LLM/pdfExtraction/pdfExtraction";
import { PDFParse } from "pdf-parse";

async function pdfParser(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

async function readPdfBytes(metadata: { location: string; size: number }) {
  const allocatedBuffer = Buffer.alloc(metadata.size);
  const fileDescriptor = await open(metadata.location, "r");
  try {
    await fileDescriptor.read(allocatedBuffer, 0, metadata.size, 0);
  } catch (e) {
    console.error("Error while reading the file into buffer!", e);
    return;
  } finally {
    await fileDescriptor.close();
  }

  // llm call to xtract pdf
  try {
    const parsedTextFromParser = await pdfParser(allocatedBuffer);
    const data = await llm_call_for_pdfExtraction(parsedTextFromParser);
    console.log("data from llm", data);
  } catch (err) {
    console.error("Error while sending the parsed text to LLM", err);
  }
}

export const pdf_extraction_worker = new Worker(
  "pdf-queue",
  async (job) => {
    const dataFromEmailWorker: pdfExtraction = job.data;
    await readPdfBytes(dataFromEmailWorker);
  },
  { connection: connectionForBullmq },
);

pdf_extraction_worker.on("failed", (job) => {
  if (job) {
    console.log(`${job.id} is failed!`);
  }
});
