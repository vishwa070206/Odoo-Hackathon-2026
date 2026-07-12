import axiosInstance from "./axios";

export const assetApi = {
  listAssets: async (params) => {
    const response = await axiosInstance.get("/assets", { params });
    return response.data;
  },

  getAssetById: async (id) => {
    const response = await axiosInstance.get(`/assets/${id}`);
    return response.data;
  },

  createAsset: async (data) => {
    const response = await axiosInstance.post("/assets", data);
    return response.data;
  },

  updateAsset: async (id, data) => {
    const response = await axiosInstance.put(`/assets/${id}`, data);
    return response.data;
  },

  updateAssetStatus: async (id, lifecycleStatus) => {
    const response = await axiosInstance.patch(`/assets/${id}/status`, { lifecycleStatus });
    return response.data;
  },

  deleteAsset: async (id) => {
    const response = await axiosInstance.delete(`/assets/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get("/assets/stats");
    return response.data;
  },

  uploadPhotos: async (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }
    const response = await axiosInstance.post(`/assets/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadDocuments: async (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }
    const response = await axiosInstance.post(`/assets/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
