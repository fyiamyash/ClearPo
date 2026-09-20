import { Worker } from "bullmq";
import { open } from "node:fs/promises";
import { connectionForBullmq } from "../queue/connection";
import type { pdfExtraction } from "../queue/jobs";
import { llm_call_for_pdfExtraction } from "../LLM/pdfExtraction/pdfExtraction";
import { PDFParse } from "pdf-parse";
import { db } from "../db/db";
import { invoiceTable, lineItems } from "../db/schema";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { reconciliation_queue } from "../queue/all-queues";

export type pdfExtractedDataType = {
  supplier_Email: string;
  supplier_name: string;
  invoice_number: string;
  total_amount: number;
  purchase_order: string;
  lineItems: [
    {
      product: string;
      quantity: number;
      unit_price: string;
      total_amount: string;
    },
  ];
};

async function pdfParser(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

async function readPdfBytes(metadata: pdfExtraction) {
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

  try {
    const parsedTextFromParser = await pdfParser(allocatedBuffer);

    // llm call to extract pdf
    const data: pdfExtractedDataType = await llm_call_for_pdfExtraction(parsedTextFromParser);

    //inset invoice details & line items
    await db.transaction(async (tx) => {
      const invoiceDataFromDb = await tx
        .update(invoiceTable)
        .set({
          supplier_Email: data.supplier_Email,
          supplier_name: data.supplier_name,
          invoice_number: data.invoice_number,
          purchase_order: data.purchase_order,
          total_amount: data.total_amount,
          status: "RECONCILING",
        })
        .where(eq(invoiceTable.id, metadata.invoiceId));

      await tx.insert(lineItems).values(
        data.lineItems.map((items) => ({
          id: randomUUID(),
          invoiceId: metadata.invoiceId,
          product: items.product!,
          quantity: items.quantity!,
          unit_price: items.unit_price!,
          total_amount: items.total_amount,
        })),
      );
      return invoiceDataFromDb;
    });
    return data;
  } catch (err) {
    console.error("Error while sending the parsed text to LLM", err);
  }
}

export const pdf_extraction_worker = new Worker(
  "pdf-queue",
  async (job) => {
    const dataFromEmailWorker: pdfExtraction = job.data;
    const storedInDB = await readPdfBytes(dataFromEmailWorker);
    if (storedInDB) {
      console.log("PDF data stored in database, procceding with adding ");
      await reconciliation_queue.add("reconciliation", storedInDB);
    }
  },
  { connection: connectionForBullmq },
);

pdf_extraction_worker.on("failed", (job) => {
  if (job) {
    console.log(`${job.id} is failed!`);
  }
});
