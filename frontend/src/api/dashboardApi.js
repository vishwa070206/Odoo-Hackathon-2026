import axiosInstance from "./axios";

export const dashboardApi = {
  getKPIs: async () => {
    const response = await axiosInstance.get("/reports/dashboard");
    return response.data;
  },

  getAssetUtilization: async () => {
    const response = await axiosInstance.get("/reports/asset-utilization");
    return response.data;
  },

  getDepartmentAllocation: async () => {
    const response = await axiosInstance.get("/reports/department-allocation");
    return response.data;
  },

  getMaintenanceCost: async () => {
    const response = await axiosInstance.get("/reports/maintenance-cost");
    return response.data;
  },

  getBookingHeatmap: async (startDate, endDate) => {
    const response = await axiosInstance.get("/reports/booking-heatmap", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAuditSummary: async () => {
    const response = await axiosInstance.get("/reports/audit-summary");
    return response.data;
  },

  getUpcomingReturns: async () => {
    const response = await axiosInstance.get("/reports/upcoming-returns");
    return response.data;
  },
};
