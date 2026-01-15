// Centralized API configuration for easy deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    signup: `${API_BASE_URL}/api/auth/signup`,
    profile: `${API_BASE_URL}/api/auth/profile`,
  },
  // Disputes
  disputes: {
    base: `${API_BASE_URL}/api/disputes`,
    byId: (id: string) => `${API_BASE_URL}/api/disputes/${id}`,
  },
  // Admin
  admin: {
    disputes: `${API_BASE_URL}/api/admin/disputes`,
    disputeById: (id: string) => `${API_BASE_URL}/api/admin/disputes/${id}`,
    lawyers: `${API_BASE_URL}/api/admin/lawyers`,
    verifyLawyer: (id: string) => `${API_BASE_URL}/api/admin/lawyer/${id}/verify`,
  },
  // Lawyer
  lawyer: {
    auth: {
      signup: `${API_BASE_URL}/api/lawyer/signup`,
      login: `${API_BASE_URL}/api/lawyer/login`,
    },
    disputes: `${API_BASE_URL}/api/lawyer/disputes`,
    disputeById: (id: string) => `${API_BASE_URL}/api/lawyer/disputes/${id}`,
  },
  // Documents
  documents: {
    base: `${API_BASE_URL}/api/documents`,
    upload: `${API_BASE_URL}/api/documents/upload`,
    uploadForDispute: `${API_BASE_URL}/api/documents/upload-for-dispute`,
    myDocuments: `${API_BASE_URL}/api/documents/my-documents`,
    blockchainStats: `${API_BASE_URL}/api/documents/blockchain/stats`,
    verifyHash: `${API_BASE_URL}/api/documents/verify-hash`,
    certificate: (id: string) => `${API_BASE_URL}/api/documents/certificate/${id}`,
  },
  // AI
  ai: {
    chat: `${API_BASE_URL}/api/ai/chat`,
    smartSearch: `${API_BASE_URL}/api/ai/smart-search`,
    insights: `${API_BASE_URL}/api/ai/insights`,
    priorityQueue: `${API_BASE_URL}/api/ai/priority-queue`,
    generateDocument: `${API_BASE_URL}/api/ai/generate-document`,
    analyzeForm: `${API_BASE_URL}/api/ai/analyze-form`,
  },
  // Health
  health: `${API_BASE_URL}/api/health`,
};

export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`;

export default API_BASE_URL;
