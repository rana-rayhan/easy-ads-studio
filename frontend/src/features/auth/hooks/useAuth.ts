import { useQuery } from "@tanstack/react-query";
import AuthApi from "../api/AuthApi";
import tokenStorage from "../../../shared/storage/tokenStorage";

const useAuth = () => {
  const { data: loggedUser, isLoading } = useQuery({
    queryKey: ["loggedUser"],
    queryFn: async () => {
      const { user, accessToken } = await AuthApi.refreshAccessToken();
      tokenStorage.saveAccessToken(accessToken); // keep the access token fresh
      return user;
    },
    enabled: tokenStorage.hasRefreshToken(), // no refresh token means nothing to restore
    retry: false,
    staleTime: 50 * 60 * 1000, // access token lasts 1h, so refresh a bit earlier
    refetchInterval: 50 * 60 * 1000, // also refresh while the tab stays open
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    loggedUser,
    roles: loggedUser?.roles ?? [],
    authLoading: isLoading,
    isLoggedIn: !!loggedUser,
  };
};

export default useAuth;
