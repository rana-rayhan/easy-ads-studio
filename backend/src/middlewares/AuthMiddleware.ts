import * as jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";

import UserRepo from "../repositories/UserRepo";
import { ILoggedUser, UserRole } from "../types/user.types";
import { CustomRequest } from "../utils/ApiResponse";
import { JWT_TOKEN_SECRET } from "../secrets/envSecret";
import { MessageKey } from "../enums/MessageKeys";
import { validateUUID } from "../utils/validators";
import Jwt from "../utils/Jwt";

export class AuthMiddleware {
  // Verify the access token and attach the authenticated user's details to the request.
  static async isLoggedInAndAuthorized(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      // Verify the token and check that it contains valid user information.
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      if (!token) throw createHttpError(400, MessageKey.AUTH_LOGIN_REQUIRED);

      let decodedToken = jwt.verify(token, JWT_TOKEN_SECRET) as ILoggedUser;
      decodedToken = jwt.verify(token, JWT_TOKEN_SECRET) as ILoggedUser;

      validateUUID(decodedToken.id, "User"); // Validate user UUID ---***

      if (!decodedToken || typeof decodedToken === "string" || !decodedToken.email) {
        throw createHttpError(401, MessageKey.AUTH_TOKEN_INVALID);
      }
      // Confirm that the user still exists in the database.
      const user = await UserRepo.findById({ id: decodedToken.id });
      if (!user) throw createHttpError(404, MessageKey.AUTH_USER_NOT_FOUND);

      // Make the user's details available to the next middleware or controller.
      req.user = { id: user.id, email: user.email };
      next();
    } catch (error) {
      return next(error);
    }
  }

  // Allow access only to users with the admin role.
  static authorizeAdmin(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw createHttpError(403, MessageKey.AUTH_LOGIN_REQUIRED);

      // if (!user.globalRole.includes(UserRole.SUPERUSER)) {
      //   throw createHttpError(403, MessageKey.AUTH_ADMIN_ONLY);
      // }

      next();
    } catch (error) {
      return next(error);
    }
  }

  // Prevent users with existing authentication cookies from logging in again.
  static isLoggedOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = req.cookies;
      if (accessToken || refreshToken) throw createHttpError(400, MessageKey.AUTH_ALREADY_LOGGED_IN);

      next();
    } catch (error) {
      return next(error);
    }
  }

  static isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      if (!token) throw createHttpError(401, "Missing access token");

      res.locals.userId = Jwt.verifyAccess({ token });
      next();
    } catch (error) {
      next(error instanceof Error && "status" in error ? error : createHttpError(401, "Invalid access token"));
    }
  };
}
