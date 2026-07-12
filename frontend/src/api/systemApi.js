import axiosInstance from "./axios";

export const systemApi = {
  globalSearch: async (q) => {
    const response = await axiosInstance.get("/search", { params: { q } });
    return response.data;
  },

  getActivityLogs: async (params) => {
    const response = await axiosInstance.get("/logs", { params });
    return response.data;
  },
};
