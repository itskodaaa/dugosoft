import { API_BASE } from "./config";

const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const vaultApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/api/vault`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/api/vault`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}/api/vault/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },
};
