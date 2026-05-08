import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Hook để fetch danh sách albums từ API
 */
export function useAlbums() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllAlbums() as any;
      // API returns { success, data: { albums: [...], total, ... } }
      if (response && response.success && response.data) {
        setAlbums(response.data.albums || []);
      } else {
        setAlbums([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return { albums, loading, error, refetch: fetchAlbums };
}

/**
 * Hook để fetch albums của artist hiện tại
 */
export function useMyAlbums(token?: string) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAlbums = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMyAlbums(token);
        setAlbums(data as any);
        setError(null);
      } catch (err) {
        console.error('Error fetching my albums:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải albums của bạn');
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAlbums();
  }, [token]);

  return { albums, loading, error };
}

/**
 * Hook để fetch danh sách artists từ API
 */
export function useArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getAllArtists();
        setArtists(data as any);
        setError(null);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải artists');
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return { artists, loading, error };
}

/**
 * Hook để fetch album stats
 */
export function useAlbumStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getAlbumStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching album stats:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải thống kê');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook để fetch artist stats
 */
export function useArtistStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getArtistStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching artist stats:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải thống kê');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook để fetch dashboard data
 */
export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await apiClient.getDashboardData();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dashboard');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
}
