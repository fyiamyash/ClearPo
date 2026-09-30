import type { Request, Response } from "express";
import { liveEventSubscriber } from "../queue/connection";

export async function timeLineController(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const invoiceId = req.params.invoiceId;
  const channelName = `invoice:${invoiceId}`;
  const onmessage = (channel: string, data: string) => {
    if (channel === channelName) {
      res.write(`data:${data}\n\n`);
    }
  };
  await liveEventSubscriber.subscribe(channelName);
  liveEventSubscriber.on("message", onmessage);

  req.on("close", () => {
    liveEventSubscriber.unsubscribe(channelName);
    liveEventSubscriber.off("message", onmessage);
    res.end();
  });
}
