import { Router } from "express";
import { asyncHandler } from "../shared/asyncHandler";
import { timeLineController } from "../controller/timeLineController";

export const timeLineRouter = Router();

timeLineRouter.get("/timeline/:invoiceId", asyncHandler(timeLineController));
