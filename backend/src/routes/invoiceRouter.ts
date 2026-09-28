import { Router } from "express";
import { asyncHandler } from "../shared/asyncHandler";
import { getInvoiceList, startFlowController } from "../controller/invoice";

export const invoiceRouter = Router();

invoiceRouter.get("/invoice", asyncHandler(getInvoiceList));
invoiceRouter.post("/startFlow/:invoiceId", asyncHandler(startFlowController));
