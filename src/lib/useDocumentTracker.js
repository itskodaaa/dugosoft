import { API_BASE } from "@/api/config";

function fileExt(name = "") {
  return (name.split(".").pop() || "").toUpperCase() || "FILE";
}

export function useDocumentTracker() {
  const track = async ({ name, size = 0, category, status = "ready", shareToken = null }) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return; // guests not tracked server-side
    try {
      await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type: fileExt(name),
          size,
          category,
          status,
          shareToken: shareToken ?? null,
        }),
      });
    } catch { /* best-effort */ }
  };

  return { track };
}
