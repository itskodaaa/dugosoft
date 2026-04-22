import { API_BASE } from "./config";

// Generic mock entity to prevent crashes on unimplemented tables
const mockEntity = {
  create: async () => ({ id: 'mock' }),
  get: async () => ({ id: 'mock', data: {} }),
  update: async () => ({ id: 'mock' }),
  delete: async () => ({ success: true }),
  list: async () => ([]),
  filter: async () => ([]),
};

export const base44 = {
  auth: {
    updateMe: async () => ({}),
    getMe: async () => ({})
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/ai/invoke`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: "invokeLLM", prompt, response_json_schema })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "AI failed");
        return data.result;
      },
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem('auth_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
          const res = await fetch(`${API_BASE}/api/ai/extract-text`, {
            method: 'POST',
            headers,
            body: formData
          });
          const data = await res.json();
          window.__lastExtractedText = data.text;
          return { file_url: "local_temp.pdf" };
        } catch (e) {
          console.error("Extraction failed", e);
          return { file_url: "mock_url.pdf" };
        }
      },
      ExtractDataFromUploadedFile: async () => {
        return { output: { text: window.__lastExtractedText || "Could not extract text from document." } };
      }
    }
  },
  entities: new Proxy({}, {
    get: function(target, prop) {
      return mockEntity;
    }
  }),
  functions: {
    invoke: async (name, params) => {
      const AI_ACTIONS = ["aiService", "parseResume", "generateInterviewQuestionsFromJD", "optimizeLinkedInProfile", "generateCoverLetter", "careerMentorChat", "chatWithDocument"];
      
      if (AI_ACTIONS.includes(name)) {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const action = name === "aiService" ? params.action : name;
        
        if (action === "parseResume" && !params.text) {
          params.text = window.__lastExtractedText;
        }
        
        const res = await fetch(`${API_BASE}/api/ai/invoke`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action, ...params })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "AI failed");
        return { data: { success: true, result: data.result, message: data.message, ...data.result } };
      }
      
      // For non-AI actions (like payments, referrals), return a successful mock
      return { data: { success: true, result: {}, message: "Mock success" } };
    }
  }
};
