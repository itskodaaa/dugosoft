const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/resumes';

export const resumesApi = {
  async getAll() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resumes');
    }
    return data;
  },

  async create(resumeData) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resumeData),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create resume');
    }
    return data;
  },

  async update(id, resumeData) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resumeData),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update resume');
    }
    return data;
  },

  async delete(id) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete resume');
    }
    return true;
  },

  async adapt(resume, region) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/adapt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resume, region }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'AI adaptation failed');
    }
    return data;
  },

  async downloadPDF(resume, template) {
    const token = localStorage.getItem('auth_token');
    const EXPORT_URL = import.meta.env.VITE_EXPORT_URL || 'http://localhost:3001/api/export/pdf';
    
    const response = await fetch(EXPORT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resume, template }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'PDF generation failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${resume.name?.replace(/\s+/g, '-') || 'download'}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
