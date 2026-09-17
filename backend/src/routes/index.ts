import { Router } from "express";
import { webHookRouter } from "./gamilWeebhook";

export const appRouter = Router();

appRouter.use(webHookRouter);
