import { useQuery } from "@tanstack/react-query";

import userAPI from "../api/userApi";
import { customConsoleLogForDev } from "../../../shared/logHelpers/logger";

const useUserHook = () => {
  // Queries
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      customConsoleLogForDev("Fetching users -------*******");
      const userList = await userAPI.fetchUsers();
      return userList;
    },

    retry: 1,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });

  return { users, isLoadingUsers: isLoading };
};

export default useUserHook;
