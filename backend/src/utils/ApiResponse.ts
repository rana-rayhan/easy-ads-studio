import { Request, Response } from "express";
import { ILoggedUser } from "../types/user.types";

// Extend Express Request to optionally include the authenticated user's information.
export type CustomRequest = Request & { user?: ILoggedUser };

class ApiResponse {
  // Return a standardized JSON response for successful requests.
  static success(res: Response, { statusCode = 200, message = "Success", payload = {} }) {
    return res.status(statusCode).json({ success: true, message, payload });
  }

  // Return a standardized JSON response for failed requests.
  static error(res: Response, { statusCode = 500, message = "Server error || Something is broken" }) {
    return res.status(statusCode).json({ success: false, message });
  }
}

export default ApiResponse; // Reuse this class across controllers for consistent API responses.
