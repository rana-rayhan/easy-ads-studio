import { Router } from "express";

import AuthController from "../controllers/AuthControllers";
import { userLoginSchema, userRegisterSchema } from "../validators/authValidator";
import runValidation from "../validators";

const authRoute = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - User / authRoute.ts
 *     description: Register user.
 */
authRoute.post("/register", runValidation(userRegisterSchema), AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - User / authRoute.ts
 *     description: Login user.
 */
authRoute.post("/login", runValidation(userLoginSchema), AuthController.login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - User / authRoute.ts
 *     description: Logout user.
 */
authRoute.post("/logout", AuthController.logout);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - User / authRoute.ts
 *     description: Refresh token route.
 */
authRoute.post("/refresh-token", AuthController.refresh);

// exporting user route
export default authRoute;
