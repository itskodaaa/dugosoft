import { API_BASE } from './config';

const BASE = `${API_BASE}/api/pdf-tools`;

function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Generic multipart request for all PDF tools.
 * @param {string} endpoint  — relative path, e.g. "/compress"
 * @param {File}   file      — the PDF file
 * @param {object} fields    — additional form fields (strings)
 * @returns {Promise<Blob>}  — the processed PDF blob
 */
export async function processPdf(endpoint, file, fields = {}) {
  const form = new FormData();
  // Fields must come before the file so @fastify/multipart can read them
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value));
    }
  }
  form.append('file', file);

  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || 'PDF processing failed');
  }

  return res.blob();
}
