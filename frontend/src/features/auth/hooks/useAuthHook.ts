import { message } from "antd";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import AuthApi from "../api/AuthApi";
import { useNavigate } from "react-router";
import tokenStorage from "../../../shared/storage/tokenStorage";
import { handleApiError } from "../../../shared/api/apiError";

const useAuthHook = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Login: save both tokens, then go to the protected area.
  const loginMutation = useMutation({
    mutationFn: AuthApi.login,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      tokenStorage.save(accessToken, refreshToken);
      queryClient.setQueryData(["loggedUser"], user);
      message.success(t("auth.loginSuccess"));
      navigate("/dashboard");
    },
    onError: handleApiError,
  });

  // Register: no tokens yet, so send the user to the login page.
  const registerMutation = useMutation({
    mutationFn: AuthApi.register,
    onSuccess: () => {
      message.success(t("auth.registerSuccess"));
      navigate("/login");
    },
    onError: handleApiError,
  });

  // Logout: delete the Redis session on the backend, then remove the tokens and clear cached data.
  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // Still log out locally even if the backend call fails.
    }
    tokenStorage.clear();
    queryClient.clear();
    navigate("/login");
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,

    logout,
  };
};

export default useAuthHook;
