import axiosInstance from "./axios";

export const bookingApi = {
  listBookings: async (params) => {
    const response = await axiosInstance.get("/bookings", { params });
    return response.data;
  },

  getCalendarEvents: async (start, end, assetId) => {
    const response = await axiosInstance.get("/bookings/calendar", {
      params: { start, end, assetId },
    });
    return response.data;
  },

  getBookableAssets: async () => {
    const response = await axiosInstance.get("/bookings/bookable-assets");
    return response.data;
  },

  createBooking: async (data) => {
    const response = await axiosInstance.post("/bookings", data);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await axiosInstance.patch(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  rescheduleBooking: async (id, startTime, endTime) => {
    const response = await axiosInstance.patch(`/bookings/${id}/reschedule`, {
      startTime,
      endTime,
    });
    return response.data;
  },
};
