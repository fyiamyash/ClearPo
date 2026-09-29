import type { Request, Response } from "express";
import { email_sync_queue, pdf_extraction_queue } from "../queue/all-queues";
import { db } from "../db/db";
import { invoiceTable, lineItems, lineItems } from "../db/schema";
import { eq } from "drizzle-orm";
import { liveEventPublisher } from "../queue/connection";
import { updateInvoiceEvents } from "../invoice/updateInvoiceEvents";

export async function invoiceController(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(404).json({ message: "File missing!" });
      return;
    }
    // console.log(file);
    setTimeout(async () => {
      await email_sync_queue.add("read-pdf", {
        fileName: file.filename,
        size: file.size,
        emailId: req.body.emailId,
        location: file.path,
      });
    }, 5000);

    console.log(`Job is created for new invoice : ${file.filename}`);

    res.send("new invoice recieved!");
  } catch (e) {
    console.log("There is some error in the gmail controller", e);
    res.status(500).json({ message: "Please try agan after sometime!" });
  }
}

export async function getInvoiceList(req: Request, res: Response) {
  const invoices = await db
    .select({
      id: invoiceTable.id,
      supplier_Email: invoiceTable.supplier_Email,
      supplier_name: invoiceTable.supplier_name,
      invoice_number: invoiceTable.invoice_number,
      total_amount: invoiceTable.total_amount,
      purchase_order: invoiceTable.purchase_order,
      status: invoiceTable.status,
      createdAt: invoiceTable.createdAt,
    })
    .from(invoiceTable);

  res.send(invoices);
}

export async function startFlowController(req: Request, res: Response) {
  const invoiceId = req.params.invoiceId;
  if (!invoiceId || typeof invoiceId !== `string`) {
    res.status(404).json({ error: "Invalidinvoiceid or should be string" });
    return;
  }
  const [invoiceExist] = await db.select().from(invoiceTable).where(eq(invoiceTable.id, invoiceId));
  if (!invoiceExist) {
    res.status(404).json({ error: "Invoice doesnt exits" });
    return;
  }
  console.log(invoiceExist.id);
  await pdf_extraction_queue.add("extract-pdf", {
    invoiceId: invoiceId,
    location: invoiceExist.location,
    size: invoiceExist.fileSize!,
  });
  await liveEventPublisher.publish(
    `invoice:${invoiceId}`,
    JSON.stringify({
      type: "invoiceEvents",
      data: "INVOICE_RECEIVED",
    }),
  );
  console.log(
    `Job is created for extracting invoice : ${invoiceExist.filename}, adding the details in extraction queue!`,
  );

  res.send({ message: "Flow started!" });
}
