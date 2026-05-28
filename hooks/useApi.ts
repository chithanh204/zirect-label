import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Generic hook để fetch data
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  errorMessage: string,
  defaultValue: T,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result !== undefined ? result : defaultValue);
      setError(null);
    } catch (err) {
      console.error(errorMessage, err);
      setError(err instanceof Error ? err.message : errorMessage);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook để fetch danh sách albums từ API
 */
export function useAlbums() {
  const { data: albums, loading, error, refetch } = useFetch<any[]>(
    async () => {
      const response = await apiClient.getAllAlbums() as any;
      return response?.success && response?.data?.albums ? response.data.albums : [];
    },
    'Lỗi khi tải albums',
    []
  );
  return { albums, loading, error, refetch };
}

/**
 * Hook để fetch albums của artist hiện tại
 */
export function useMyAlbums(token?: string) {
  const { data: albums, loading, error, refetch } = useFetch<any[]>(
    async () => {
      const response = await apiClient.getMyAlbums(token);
      return response as any[] || [];
    },
    'Lỗi khi tải albums của bạn',
    [],
    [token]
  );
  return { albums, loading, error, refetch };
}

/**
 * Hook để fetch danh sách artists từ API
 */
export function useArtists() {
  const { data: artists, loading, error, refetch } = useFetch<any[]>(
    async () => {
      const response = await apiClient.getAllArtists();
      return response as any[] || [];
    },
    'Lỗi khi tải artists',
    []
  );
  return { artists, loading, error, refetch };
}

/**
 * Hook để fetch album stats
 */
export function useAlbumStats() {
  const { data: stats, loading, error, refetch } = useFetch<any>(
    async () => await apiClient.getAlbumStats(),
    'Lỗi khi tải thống kê albums',
    null
  );
  return { stats, loading, error, refetch };
}

/**
 * Hook để fetch artist stats
 */
export function useArtistStats() {
  const { data: stats, loading, error, refetch } = useFetch<any>(
    async () => await apiClient.getArtistStats(),
    'Lỗi khi tải thống kê artists',
    null
  );
  return { stats, loading, error, refetch };
}

/**
 * Hook để fetch dashboard data
 */
export function useDashboard() {
  const { data, loading, error, refetch } = useFetch<any>(
    async () => await apiClient.getDashboardData(),
    'Lỗi khi tải dashboard',
    null
  );
  return { data, loading, error, refetch };
}
