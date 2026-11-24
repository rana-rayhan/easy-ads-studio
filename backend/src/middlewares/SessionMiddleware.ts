import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import SessionService from "../services/SessionService";

class SessionMiddleware {
  // Reads the sessionId cookie, looks it up in Redis, and stores the userId in res.locals.
  static async requireSession(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.cookies?.sessionId as string | undefined;
      if (!sessionId) throw createHttpError(401, "Please login first");

      const userId = await SessionService.getUserId(sessionId);
      if (!userId) throw createHttpError(401, "Session expired, please login again");

      res.locals.userId = userId;
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default SessionMiddleware;
