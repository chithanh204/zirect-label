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
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
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
      localStorage.removeItem('authToken');
    }
  }

  async updatePassword(data: any, token?: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: data,
      token,
    });
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

  async createAlbumAdmin(data: any, token?: string) {
    return this.request('/albums/admin', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async getAlbumDetail(id: string | number) {
    return this.request(`/albums/${id}/detail`);
  }

  async addCollaborator(albumId: string | number, artistId: string, role: string, token?: string) {
    return this.request(`/albums/${albumId}/collaborators`, {
      method: 'POST',
      body: { artistId, role },
      token,
    });
  }

  async removeCollaborator(albumId: string | number, artistId: string, token?: string) {
    return this.request(`/albums/${albumId}/collaborators/${artistId}`, {
      method: 'DELETE',
      token,
    });
  }

  async updateTrackPlatform(trackId: string, platform: string, data: { streams?: number, copyrightFlag?: boolean, url?: string }, token?: string) {
    return this.request(`/albums/tracks/${trackId}/platforms`, {
      method: 'PUT',
      body: { platform, ...data },
      token,
    });
  }

  async getRevenueSplits(albumId: string | number) {
    return this.request(`/albums/${albumId}/revenue-split`);
  }

  async updateRevenueSplits(albumId: string | number, splits: { artistId: string, percentage: number }[], token?: string) {
    return this.request(`/albums/${albumId}/revenue-split`, {
      method: 'PUT',
      body: { splits },
      token,
    });
  }

  // ========== Platform Revenue & Payments ==========
  async updatePlatformRevenue(albumId: string | number, platform: string, totalRevenue: number, token?: string) {
    return this.request(`/albums/${albumId}/revenue/${platform}`, {
      method: 'PUT',
      body: { totalRevenue },
      token,
    });
  }

  async addPlatformPayment(albumId: string | number, platform: string, amount: number, note?: string, token?: string) {
    return this.request(`/albums/${albumId}/payments/${platform}`, {
      method: 'POST',
      body: { amount, note },
      token,
    });
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

  async verifyPaymentInfo(id: string | number, token?: string) {
    return this.request(`/artists/${id}/payment/verify`, {
      method: 'PUT',
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

  // ========== Admin - Artists ==========
  async createArtist(data: any, token?: string) {
    return this.request('/artists', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async resetArtistPassword(artistId: string, token?: string) {
    return this.request(`/artists/${artistId}/reset-password`, {
      method: 'POST',
      token,
    });
  }

  // ========== Upload ==========
  async uploadImage(file: File, folder: string = 'zirect/avatars'): Promise<any> {
    const url = `${this.baseURL}/upload/image?folder=${encodeURIComponent(folder)}`;

    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export the class for testing/custom instances
export default APIClient;
