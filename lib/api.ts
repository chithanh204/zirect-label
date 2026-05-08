/**
 * API Client for Zirect Label Frontend
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { method = 'GET', headers = {}, body, token } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization token if provided
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      // Try to get token from localStorage
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (storedToken) {
        requestHeaders['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      // Parse and return JSON
      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request Error [${method} ${url}]:`, error);
      throw error;
    }
  }

  // ========== Auth ==========
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async logout() {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // ========== Albums ==========
  async getAllAlbums() {
    return this.request('/albums');
  }

  async getAlbumById(id: string | number) {
    return this.request(`/albums/${id}`);
  }

  async getMyAlbums(token?: string) {
    return this.request('/albums/my/list', { token });
  }

  async createAlbum(data: any, token?: string) {
    return this.request('/albums', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateAlbumStatus(id: string | number, status: string, token?: string) {
    return this.request(`/albums/${id}/status`, {
      method: 'PUT',
      body: { status },
      token,
    });
  }

  async getAlbumStats() {
    return this.request('/albums/stats');
  }

  // ========== Artists ==========
  async getAllArtists() {
    return this.request('/artists');
  }

  async getArtistById(id: string | number) {
    return this.request(`/artists/${id}`);
  }

  async getMyArtistProfile(token?: string) {
    return this.request('/artists/profile/me', { token });
  }

  async updateArtistProfile(data: any, token?: string) {
    return this.request('/artists/profile/me', {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async getArtistStats() {
    return this.request('/artists/stats');
  }

  // ========== Analytics ==========
  async getAnalytics(filters?: any) {
    const query = new URLSearchParams(filters || {}).toString();
    return this.request(`/analytics${query ? `?${query}` : ''}`);
  }

  // ========== Dashboard ==========
  async getDashboardData() {
    return this.request('/admin/dashboard');
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export the class for testing/custom instances
export default APIClient;
