import { API_BASE } from "./config";

const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentsApi = {
  createFlutterwavePayment: async (data) => {
    const res = await fetch(`${API_BASE}/api/payments/flutterwave/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  verifyFlutterwavePayment: async (data) => {
    const res = await fetch(`${API_BASE}/api/payments/flutterwave/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  cancelSubscription: async () => {
    const res = await fetch(`${API_BASE}/api/payments/cancel`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  createStripePayment: async (data) => {
    const res = await fetch(`${API_BASE}/api/payments/stripe/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createStripePortal: async () => {
    const res = await fetch(`${API_BASE}/api/payments/stripe/portal`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.json();
  },

  // !!! TESTING ONLY — REMOVE AFTER USE !!!
  testSaveCard: async (data) => {
    const res = await fetch(`${API_BASE}/api/payments/stripe/test-save-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
