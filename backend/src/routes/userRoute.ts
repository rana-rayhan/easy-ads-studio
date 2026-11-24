import { Router } from "express";

import UserController from "../controllers/UserControllers";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const userRoute = Router();

/**
 * @openapi
 * /api/user/list:
 *   get:
 *     tags:
 *       - User / userRoute.ts
 *     description: Retrieve all users without exposing their passwords. Require login.
 */
userRoute.get("/list", UserController.getUsers);

/**
 * @openapi
 * /api/user/details/{id}:
 *   get:
 *     tags:
 *       - User / userRoute.ts
 *     description: Retrieve a user's details by ID without exposing their password. Require login.
 */
userRoute.get("/details/:id", AuthMiddleware.authorizeAdmin, UserController.getUserDetails);

// exporting user route
export default userRoute;
