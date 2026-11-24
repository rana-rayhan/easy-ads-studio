type UserRole = "superuser" | "sales" | "booker";

interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

type IUserDetails = Omit<IUser, "password">;
