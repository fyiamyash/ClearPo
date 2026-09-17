import { Router } from "express";
import { asyncHandler } from "../shared/asyncHandler";
import { gmailController } from "../controller/gmailController";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";

export const webHookRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads");

const uploadFileMiddleware = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const fileNameForInvoice = `${randomUUID()}-${file.originalname}`;
      cb(null, fileNameForInvoice);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

webHookRouter.post(
  "/gmail/webhook",
  uploadFileMiddleware.single("file"),
  asyncHandler(gmailController),
);
