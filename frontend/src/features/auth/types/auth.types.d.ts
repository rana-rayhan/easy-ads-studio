type LoginFormType = { email: string; password: string };

type RegisterFormType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// What the backend login returns inside `payload`.
type LoginResponse = { user: IUser; accessToken: string; refreshToken: string };
type RefreshResponse = { user: IUser; accessToken: string };
