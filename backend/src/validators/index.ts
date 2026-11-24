import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { MessageKey } from "../enums/MessageKeys";

export const runValidation =
  (schema: z.ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(422).json({
        statusCode: 422,
        message: result.error.issues[0]?.message ?? MessageKey.COMMON_BAD_REQUEST,
      });
      return;
    }

    req.body = result.data;
    next();
  };

export default runValidation;
