import axiosInstance from "./axios";

export const auditApi = {
  listCycles: async (params) => {
    const response = await axiosInstance.get("/audits", { params });
    return response.data;
  },

  getCycleById: async (id) => {
    const response = await axiosInstance.get(`/audits/${id}`);
    return response.data;
  },

  createCycle: async (data) => {
    const response = await axiosInstance.post("/audits", data);
    return response.data;
  },

  assignAuditor: async (cycleId, auditorId, scope) => {
    const response = await axiosInstance.post(`/audits/${cycleId}/assign`, {
      auditorId,
      scope,
    });
    return response.data;
  },

  verifyItem: async (itemId, verificationStatus, notes) => {
    const response = await axiosInstance.patch(`/audits/items/${itemId}/verify`, {
      verificationStatus,
      notes,
    });
    return response.data;
  },

  closeCycle: async (id) => {
    const response = await axiosInstance.patch(`/audits/${id}/close`);
    return response.data;
  },
};
