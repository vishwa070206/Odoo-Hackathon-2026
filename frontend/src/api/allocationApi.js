import axiosInstance from "./axios";

export const allocationApi = {
  // Allocations
  listAllocations: async (params) => {
    const response = await axiosInstance.get("/allocations", { params });
    return response.data;
  },

  allocateAsset: async (data) => {
    const response = await axiosInstance.post("/allocations", data);
    return response.data;
  },

  returnAsset: async (data) => {
    const response = await axiosInstance.post("/allocations/return", data);
    return response.data;
  },

  getOverdue: async () => {
    const response = await axiosInstance.get("/allocations/overdue");
    return response.data;
  },

  // Transfers
  listTransfers: async (params) => {
    const response = await axiosInstance.get("/transfers", { params });
    return response.data;
  },

  createTransfer: async (data) => {
    const response = await axiosInstance.post("/transfers", data);
    return response.data;
  },

  approveTransfer: async (id) => {
    const response = await axiosInstance.patch(`/transfers/${id}/approve`);
    return response.data;
  },

  rejectTransfer: async (id) => {
    const response = await axiosInstance.patch(`/transfers/${id}/reject`);
    return response.data;
  },

  completeTransfer: async (id) => {
    const response = await axiosInstance.patch(`/transfers/${id}/complete`);
    return response.data;
  },
};
