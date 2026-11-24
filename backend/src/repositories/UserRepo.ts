import { Repository, FindOptionsRelations, FindOptionsOrder, DeepPartial } from "typeorm";

import { validateUUID } from "../utils/validators";
import AppDataSource from "../database/AppDataSource";
import { User } from "../entities/UserEntity";

type ItemOrder = FindOptionsOrder<User>;
type ItemRelations = FindOptionsRelations<User>;
type IFindUserById = { id?: string; relations?: ItemRelations; order?: ItemOrder };
type IFindUserByEmail = { email: string; relations?: ItemRelations; order?: ItemOrder };

class UserRepo {
  private static repo: Repository<User> = AppDataSource.getRepository(User);

  static findById({ id, relations }: IFindUserById) {
    validateUUID(id, "User");
    return this.repo.findOne({ where: { id }, relations });
  }

  static findByEmail({ email, relations }: IFindUserByEmail) {
    return this.repo.findOne({ where: { email }, relations });
  }

  static findAll() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  static create(data: DeepPartial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  static update(data: User) {
    return this.repo.save(data);
  }

  static delete(data: User) {
    return this.repo.remove(data);
  }
}

export default UserRepo;
