import * as jwt from "jsonwebtoken";
import createHttpError from "http-errors";

import UserRepo from "../repositories/UserRepo";
import { JWT_TOKEN_SECRET } from "../secrets/envSecret";
import { MessageKey } from "../enums/MessageKeys";
import { ILoggedUser, UserRole } from "../types/user.types";
import { User } from "../entities/UserEntity";
import bcrypt from "bcrypt";
import Jwt from "../utils/Jwt";

class AuthService {
  static async register(data: { firstName: string; lastName: string; email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    // The email column is unique, so check first and give a clear error.
    const existingUser = await UserRepo.findByEmail({ email });
    if (existingUser) throw createHttpError(409, MessageKey.USER_EMAIL_EXISTS);

    // The password is hashed by the entity's @BeforeInsert hook, so pass it in plain here.
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await UserRepo.create({ email, passwordHash });

    return AuthService.toSafeUser(user);
  }
  // Authenticate the user and set their token cookies.
  static async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();
    const user = await UserRepo.findByEmail({ email });

    // Same error for "no user" and "wrong password", so nobody can test which emails exist.
    const ok = user && (await bcrypt.compare(data.password, user.passwordHash));
    if (!user || !ok) throw createHttpError(401, "Invalid email or password");

    return {
      user: AuthService.toSafeUser(user),
      accessToken: Jwt.signAccess({ userId: user.id }),
      refreshToken: Jwt.signRefresh({ userId: user.id }),
    };
  }

  static async refresh({ refreshToken }: { refreshToken?: string }) {
    if (!refreshToken) throw createHttpError(401, "Missing refresh token");
    let userId: string;
    try {
      userId = Jwt.verifyRefresh({ token: refreshToken });
    } catch {
      throw createHttpError(401, "Invalid refresh token");
    }

    // The frontend needs the user back, and the user must still exist.
    const user = await UserRepo.findById({ id: userId });
    if (!user) throw createHttpError(401, "Invalid refresh token");

    return { user: AuthService.toSafeUser(user), accessToken: Jwt.signAccess({ userId }) };
  }

  // Only send safe fields to the client. Never send the password hash.
  private static toSafeUser(user: User) {
    return { id: user.id, email: user.email };
  }
}

export default AuthService;
