import { Router } from "express";
import { uploadRouter } from "./uploadFile";
import { timeLineRouter } from "./timeLine";
import { invoiceRouter } from "./invoiceRouter";

export const appRouter = Router();

appRouter.use(uploadRouter);
appRouter.use(timeLineRouter);
appRouter.use(invoiceRouter);
