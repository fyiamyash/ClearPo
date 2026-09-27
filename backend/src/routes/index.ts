import { Router } from "express";
import { webHookRouter } from "./gamilWeebhook";
import { timeLineRouter } from "./timeLine";

export const appRouter = Router();

appRouter.use(webHookRouter);
appRouter.use(timeLineRouter);
