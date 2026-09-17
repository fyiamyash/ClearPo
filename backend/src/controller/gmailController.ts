import type { Request, Response } from "express";
import { email_sync_queue } from "../queue/all-queues";

export async function gmailController(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(404).json({ message: "File missing!" });
      return;
    }
    // console.log(file);
    await email_sync_queue.add("read-pdf", {
      fileName: file.filename,
      size: file.size,
      emailId: req.body.emailId,
      location: file.path,
    });

    console.log(`Job is created for new invoice : ${file.filename}`);

    res.send("new invoice recieved!");
  } catch (e) {
    console.log("There is some error in the gmail controller", e);
    res.status(500).json({ message: "Please try agan after sometime!" });
  }
}
