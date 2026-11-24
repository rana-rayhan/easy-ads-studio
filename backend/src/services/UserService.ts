import createHttpError from "http-errors";

import UserRepo from "../repositories/UserRepo";

class UserService {
  // Return all users without their passwords.
  static async getUsers() {
    const users = await UserRepo.findAll();
    return users.map(({ passwordHash: _, ...restUser }) => ({ ...restUser }));
  }

  // Find a user by ID and exclude their password.
  static async getUserDetails(userId: string) {
    const user = await UserRepo.findById({ id: userId });
    if (!user) throw createHttpError(404, "User with the given ID does not exist!");

    const { passwordHash: _, ...userDetailsWithoutPassword } = user;
    return userDetailsWithoutPassword;
  }
}

export default UserService;
