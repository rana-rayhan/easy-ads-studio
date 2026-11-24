export enum UserRole {
  SUPERUSER = "superuser",
  SALES_REP = "sales",
  BOOKER = "booker",
}

export type ILoggedUser = { id: string; email: string };

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmationStatus: boolean;
  globalRole: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
