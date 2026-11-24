import axiosInstance from "../../../shared/api/axiosInstance";
import tokenStorage from "../../../shared/storage/tokenStorage";

class AuthApi {
  static async login(credentials: LoginFormType) {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data.payload as LoginResponse;
  }

  static async register(userData: RegisterFormType) {
    const { data } = await axiosInstance.post("/auth/register", userData);
    return data;
  }

  static async refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    const { data } = await axiosInstance.post("/auth/refresh-token", { refreshToken });
    return data.payload as RefreshResponse;
  }

  static async logout() {
    await axiosInstance.post("/auth/logout");
  }
}

export default AuthApi;
