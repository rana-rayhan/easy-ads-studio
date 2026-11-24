import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import userAPI from "../api/userApi";
import { customConsoleLogForDev } from "../../../shared/logHelpers/logger";

const useUserDetailsHook = (userId: string) => {
  const navigate = useNavigate();

  // Queries
  const { data: userDetails, isLoading: isUserDetailsLoading } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: async () => {
      customConsoleLogForDev("Fetching user details ------***");
      const userDetails = await userAPI.fetchUserDetails(userId);
      return userDetails;
    },

    retry: 1,
    gcTime: 45 * 60 * 1000,
    staleTime: 40 * 60 * 1000,
  });

  return { userDetails, isUserDetailsLoading, navigate };
};

export default useUserDetailsHook;
