const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface SubmissionPayload {
  from: {
    name?: string;
    class?: string;
    department?: string;
  };
  to: {
    name?: string;
    class?: string;
    department?: string;
  };
  message: string;
}

export interface SubmissionResponse {
  received: boolean;
  reference: string;
  error?: string;
}

export interface AdminSubmission {
  id: string;
  publicId: string;
  fromName: string | null;
  fromClass: string | null;
  fromDepartment: string | null;
  toName: string | null;
  toClass: string | null;
  toDepartment: string | null;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'ARCHIVED';
  safetyFlags: string[];
  isCaution: boolean;
  createdAt: string;
  instagramPost?: {
    id: string;
    status: string;
    template: string;
    publishedAt: string | null;
  } | null;
}

export interface SubmissionListResponse {
  submissions: AdminSubmission[];
  counts: {
    total: number;
    pending: number;
    approved: number;
    archived: number;
  };
  guidelines?: Array<{ id: string; category: string; rule: string }>;
}

export const api = {
  // Public Submission (No Auth)
  async submitConfession(payload: SubmissionPayload): Promise<SubmissionResponse> {
    const res = await fetch(`${API_BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit confession.');
    }
    return data;
  },

  // Admin Login
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: any }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials.');
    }
    return data;
  },

  // Admin Check Session
  async getAdminMe(token: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  // Admin Get Pending Submissions
  async getAdminPending(token: string): Promise<SubmissionListResponse> {
    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch pending queue.');
    return data;
  },

  // Admin Get All Submissions with Filters
  async getAdminSubmissions(
    token: string,
    status?: string,
    search?: string
  ): Promise<SubmissionListResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch submissions.');
    }
    return data;
  },

  // Admin Approve Submission
  async approveSubmission(token: string, id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve submission.');
    return data;
  },

  // Admin Generate Instagram Post
  async generateInstagramPost(token: string, id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate post data.');
    return data;
  },

  // Admin Publish / Mark as Published on Instagram
  async publishInstagram(token: string, id: string, payload?: { imageUrl?: string; caption?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/${id}/publish-instagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload || {}),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish post.');
    return data;
  },

  // Admin Delete Submission
  async deleteSubmission(token: string, id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/submissions/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete submission.');
    return data;
  },
};
