import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export const userService = {
  PROFILE: async (userId: any) => {
    const { data } = await api.get(
      ENDPOINTS.USER.PROFILE, {params: { userId }}  );
    return data;
  },
};
