import { API_ENDPOINT } from "../../../secrect";
import axiosInstance from "../../../shared/api/axiosInstance";

const userAPI = {
  fetchUsers: async () => {
    const { data } = await axiosInstance.get(`${API_ENDPOINT}/user/list`);
    return data.payload as IUserDetails[];
  },

  fetchUserDetails: async (userId: string) => {
    const { data } = await axiosInstance.get(`${API_ENDPOINT}/user/details/${userId}`);
    return data.payload as IUserDetails;
  },
};

export default userAPI;
