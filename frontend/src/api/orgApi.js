import axiosInstance from "./axios";

export const orgApi = {
  // Departments
  listDepartments: async (params) => {
    const response = await axiosInstance.get("/departments", { params });
    return response.data;
  },

  getDepartmentHierarchy: async () => {
    const response = await axiosInstance.get("/departments/hierarchy");
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await axiosInstance.post("/departments", data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data;
  },

  deactivateDepartment: async (id) => {
    const response = await axiosInstance.patch(`/departments/${id}/deactivate`);
    return response.data;
  },

  // Categories
  listCategories: async (params) => {
    const response = await axiosInstance.get("/categories", { params });
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await axiosInstance.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },

  // Users / Employees
  listUsers: async (params) => {
    const response = await axiosInstance.get("/users", { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  promoteUser: async (id, roleId) => {
    const response = await axiosInstance.patch(`/users/${id}/promote`, { roleId });
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/activate`);
    return response.data;
  },

  getRoles: async () => {
    const response = await axiosInstance.get("/users/roles");
    return response.data;
  },
};
