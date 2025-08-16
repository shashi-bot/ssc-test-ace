// API client with authentication handling
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = '';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// API helper functions for specific endpoints
export const api = {
  // Tests
  getTests: () => apiClient.get('/api/tests'),
  
  // Test attempts
  createTestAttempt: (testId: string) => apiClient.post('/api/test-attempts', { testId }),
  getTestAttempt: (attemptId: string) => apiClient.get(`/api/test-attempts/${attemptId}`),
  getUserAttempts: () => apiClient.get('/api/user-attempts'),
  
  // Questions
  getTestQuestions: (testId: string) => apiClient.get(`/api/test-questions/${testId}`),
  
  // Profile
  getProfile: () => apiClient.get('/api/profile'),
  
  // Question attempts
  createQuestionAttempt: (data: any) => apiClient.post('/api/question-attempts', data),
  updateQuestionAttempt: (attemptId: string, questionId: string, data: any) => 
    apiClient.put(`/api/question-attempts/${attemptId}/${questionId}`, data),
};