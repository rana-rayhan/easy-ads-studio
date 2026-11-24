import { DataSource } from "typeorm";
import { databaseSecret, isMigrationRequired } from "../secrets/envSecret";
import { Campaign } from "../entities/Campaign";
import { User } from "../entities/UserEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  // host, port, username, password, database come from .env (DB_HOST, DB_PORT ...)
  ...databaseSecret,
  entities: [Campaign, User],
  synchronize: isMigrationRequired,
  logging: isMigrationRequired ? ["error", "migration", "schema", "warn"] : false,
});

export default AppDataSource;
