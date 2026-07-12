import axiosInstance from "./axios";

export const authApi = {
  signup: async (data) => {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axiosInstance.post("/auth/reset-password", { token, password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },
};
