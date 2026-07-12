import axiosInstance from "./axios";

export const notificationApi = {
  listNotifications: async (params) => {
    const response = await axiosInstance.get("/notifications", { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch("/notifications/read-all");
    return response.data;
  },
};
