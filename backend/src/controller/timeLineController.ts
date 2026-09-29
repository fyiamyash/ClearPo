import type { Request, Response } from "express";
import { liveEventSubscriber } from "../queue/connection";

export async function timeLineController(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const invoiceId = req.params.invoiceId;
  await liveEventSubscriber.subscribe(`invoice:${invoiceId}`);
  liveEventSubscriber.on("message", (channel, data) => {
    console.log("here i found the data", data, "channel", channel);
    if (channel == `invoice:${invoiceId}`) {
      res.write(`data:${data}\n\n`);
    }
  });

  req.on("close", () => {
    liveEventSubscriber.unsubscribe(`invoice:${invoiceId}`);
    liveEventSubscriber.off("message", onmessage);
    res.end();
  });
}
