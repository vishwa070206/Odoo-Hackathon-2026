import axiosInstance from "./axios";

export const maintenanceApi = {
  listRequests: async (params) => {
    const response = await axiosInstance.get("/maintenance", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/maintenance/${id}`);
    return response.data;
  },

  createRequest: async (data) => {
    const response = await axiosInstance.post("/maintenance", data);
    return response.data;
  },

  updateWorkflow: async (id, workflowStatus, data) => {
    const response = await axiosInstance.patch(`/maintenance/${id}/workflow`, {
      workflowStatus,
      ...data,
    });
    return response.data;
  },
};
