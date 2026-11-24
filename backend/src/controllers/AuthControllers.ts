import { Request, Response, NextFunction } from "express";

import ApiResponse from "../utils/ApiResponse";
import AuthService from "../services/AuthService";
import createHttpError from "http-errors";
import { MessageKey } from "../enums/MessageKeys";
import SessionService from "../services/SessionService";

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Basic checks. A validation library can replace this later.
      if (!firstName || !lastName || !email || !password || String(password).length < 8) {
        throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);
      }

      const user = await AuthService.register({ firstName, lastName, email, password });
      return ApiResponse.success(res, { statusCode: 201, payload: user, message: MessageKey.AUTH_REGISTER_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  // Authenticate the user and return the access token.
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw createHttpError(400, MessageKey.COMMON_BAD_REQUEST);

      const { user, accessToken, refreshToken } = await AuthService.login({ email, password });

      // The refresh token lives in an httpOnly cookie, so JavaScript in the browser cannot read it.
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set to true in production (HTTPS)
        path: "/api/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Session lives in Redis. The cookie only holds the session id.
      const sessionId = await SessionService.create(user.id);
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set to true in production (HTTPS)
        path: "/",
        maxAge: 60 * 60 * 1000,
      });

      // The frontend stores refreshToken in localStorage, so it is also sent in the body.
      return ApiResponse.success(res, {
        statusCode: 200,
        payload: { user, accessToken, refreshToken },
        message: "Logged in",
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Accept the token from the body (frontend) or the cookie.
      const refreshToken = (req.body?.refreshToken as string | undefined) || req.cookies?.refreshToken;
      const result = await AuthService.refresh({ refreshToken });

      // Give a new Redis session too, so /api/ads keeps working after the 1h session ends.
      const oldSessionId = req.cookies?.sessionId as string | undefined;
      if (oldSessionId) await SessionService.delete(oldSessionId);
      const sessionId = await SessionService.create(result.user.id);
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set to true in production (HTTPS)
        path: "/",
        maxAge: 60 * 60 * 1000,
      });

      return ApiResponse.success(res, { statusCode: 200, payload: result, message: "Token refreshed" });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.cookies?.sessionId as string | undefined;
      if (sessionId) await SessionService.delete(sessionId);

      res.clearCookie("refreshToken", { path: "/api/auth" });
      res.clearCookie("sessionId", { path: "/" });
      return ApiResponse.success(res, { statusCode: 200, message: "Logged out" });
    } catch (error) {
      next(error);
    }
  }
}

// Export the controller for use in the authentication routes.
export default AuthController;
