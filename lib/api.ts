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

      // Handle non-200 responses gracefully – return { success: false } instead of throwing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `API Error: ${response.status} ${response.statusText}`;
        console.error(`API Request Error [${method} ${url}]:`, message);
        return { success: false, message, status: response.status } as unknown as T;
      }

      // Parse and return JSON
      const data: T = await response.json();
      return data;
    } catch (error) {
      // Network-level error (no connectivity, CORS, etc.)
      const message = error instanceof Error ? error.message : 'Network error';
      console.error(`API Network Error [${method} ${url}]:`, error);
      return { success: false, message } as unknown as T;
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

  async updateAlbumStatus(id: string | number, status: string, data?: any, token?: string) {
    return this.request(`/albums/${id}/status`, {
      method: 'PUT',
      body: data || { status },
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

  async updateTrackMetadata(trackId: string, data: any, token?: string) {
    return this.request(`/albums/tracks/${trackId}/metadata`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async addTrack(albumId: string | number, token?: string) {
    return this.request(`/albums/${albumId}/tracks`, {
      method: 'POST',
      token,
    });
  }

  async deleteTrack(trackId: string, token?: string) {
    return this.request(`/albums/tracks/${trackId}`, {
      method: 'DELETE',
      token,
    });
  }

  async accumulateRevenue(albumId: string | number, amount: number, token?: string) {
    return this.request(`/albums/${albumId}/revenue/accumulate`, {
      method: 'PUT',
      body: { amount },
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

  async getAlbumSpotifyTracks(albumId: string | number) {
    return this.request(`/albums/${albumId}/spotify-tracks`);
  }

  async deleteAlbum(id: string | number, token?: string) {
    return this.request(`/albums/${id}`, {
      method: 'DELETE',
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

  // ========== Authentication Current User ==========
  async getCurrentUser(token?: string) {
    return this.request('/auth/me', { token });
  }

  // ========== Home Page & Featured Releases ==========
  async getHomePageConfig() {
    return this.request('/home-page/config');
  }

  async updateHomePageConfig(data: any, token?: string) {
    return this.request('/home-page/admin/config', {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async getFeaturedReleases() {
    return this.request('/home-page/featured');
  }

  async createFeaturedRelease(data: any, token?: string) {
    return this.request('/home-page/admin/featured', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateFeaturedRelease(id: string, data: any, token?: string) {
    return this.request(`/home-page/admin/featured/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async deleteFeaturedRelease(id: string, token?: string) {
    return this.request(`/home-page/admin/featured/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async reorderFeaturedReleases(orderedIds: string[], token?: string) {
    const releases = orderedIds.map((id, index) => ({ id, order: index }));
    return this.request('/home-page/admin/featured/reorder', {
      method: 'PUT',
      body: { releases },
      token,
    });
  }

  // ========== Contact & Contracts ==========
  async submitContract(data: any) {
    return this.request('/contracts/submit', {
      method: 'POST',
      body: data,
    });
  }

  async getContractSubmissions(token?: string) {
    return this.request('/contracts/admin', { token });
  }

  async updateContractStatus(id: string, status: string, token?: string) {
    return this.request(`/contracts/admin/${id}/status`, {
      method: 'PUT',
      body: { status },
      token,
    });
  }

  // ========== Reports ==========
  async getContractReports(token?: string) {
    return this.request('/admin/reports/contracts', { token });
  }

  async getDiscrepancyReports(token?: string) {
    return this.request('/admin/reports/discrepancies', { token });
  }

  async getReleaseScheduleReports(token?: string) {
    return this.request('/admin/reports/release-schedule', { token });
  }

  async getAdminAnalytics(token?: string) {
    return this.request('/admin/reports/analytics', { token });
  }

  // ========== Album Payments & Payment Logs ==========
  async getAlbumPaymentSummary(albumId: string | number, token?: string) {
    return this.request(`/albums/${albumId}/payment-summary`, { token });
  }

  async addAlbumPaymentLog(albumId: string | number, data: { artistId: string, amount: number, paypalAccount?: string }, token?: string) {
    return this.request(`/albums/${albumId}/payments`, {
      method: 'POST',
      body: data,
      token,
    });
  }

  async getAlbumPaymentLogs(albumId: string | number, token?: string) {
    return this.request(`/albums/${albumId}/payment-logs`, { token });
  }

  // ========== Artist Admin update ==========
  async updateArtistAdmin(id: string | number, data: { name?: string; email?: string; paypalAccount?: string; composerName?: string; isActive?: boolean; isAdmin?: boolean }, token?: string) {
    return this.request(`/artists/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  // ========== Revenue & PayPal Payouts ==========
  async getArtistPaymentSummaryAdmin() {
    return this.request('/revenue/artists');
  }

  async getArtistUnpaidAlbums(artistId: string) {
    return this.request(`/revenue/artists/${artistId}/unpaid-albums`);
  }

  async processPayout(data: { artistId: string; amount: number; paypalAccount: string; transactionId: string; receiptUrl?: string; note?: string; allocations?: any[] }) {
    return this.request('/revenue/payout', {
      method: 'POST',
      body: data,
    });
  }

  async verifyPayPalAdmin(artistId: string) {
    return this.request(`/revenue/artists/${artistId}/verify-paypal`, {
      method: 'POST',
    });
  }

  async updateMyPayPal(paypalAccount: string) {
    return this.request('/revenue/my-paypal', {
      method: 'PUT',
      body: { paypalAccount },
    });
  }

  async getMyPayments() {
    return this.request('/revenue/my-payments');
  }

  async importRevenueExcel(file: File, paymentMonth?: string): Promise<any> {
    const url = `${this.baseURL}/revenue/import`;
    const formData = new FormData();
    formData.append('file', file);
    if (paymentMonth) {
      formData.append('paymentMonth', paymentMonth);
    }

    const headers: Record<string, string> = {};
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Import Error: ${response.status}`);
    }

    return await response.json();
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
