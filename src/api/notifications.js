import { API_BASE } from "./config";

const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationsApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  markAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "POST",
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  markAllAsRead: async () => {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "POST",
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },
};
