import type { Request, Response } from "express";

export async function gmailController(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return;
    }
    console.log(file.destination);

    res.send("hello");
  } catch (e) {
    console.log(":adaofsd", e);
  }
}
