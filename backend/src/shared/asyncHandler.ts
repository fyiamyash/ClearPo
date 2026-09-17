import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(
  controllerFunc: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler {
  return function wrapperFunction(req, res, next) {
    controllerFunc(req, res, next).catch(next);
  };
}
