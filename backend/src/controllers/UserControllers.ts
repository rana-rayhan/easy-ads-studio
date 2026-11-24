import { Request, Response, NextFunction } from "express";

import UserService from "../services/UserService";
import ApiResponse from "../utils/ApiResponse";
import { MessageKey } from "../enums/MessageKeys";

class UserController {
  // Retrieve all users and return them in the response.
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsers();

      return ApiResponse.success(res, { statusCode: 200, payload: users, message: MessageKey.USER_LIST_FETCHED });
    } catch (error) {
      next(error);
    }
  }

  // Retrieve a user's details using their ID.
  static async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUserDetails(String(req.params.id));

      return ApiResponse.success(res, {
        statusCode: 200,
        payload: users,
        message: MessageKey.USER_DETAILS_FETCHED,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export the controller so the routes can use its methods.
export default UserController;
