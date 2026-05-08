'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, ChevronRight, Music, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { useState } from 'react';
import { useAlbums } from '@/hooks/useApi';

const statusConfig = {
  submit: { label: 'Submitted', icon: Clock, color: 'bg-blue-500/20 text-blue-500' },
  making_cover_art: { label: 'Making Cover Art', icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-500' },
  delivering: { label: 'Delivering', icon: Clock, color: 'bg-purple-500/20 text-purple-500' },
  distributed: { label: 'Distributed', icon: CheckCircle, color: 'bg-green-500/20 text-green-500' },
  conflict: { label: 'Conflict', icon: AlertCircle, color: 'bg-orange-500/20 text-orange-500' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'bg-red-500/20 text-red-500' }
};

export function AlbumsManagement() {
  const { albums, loading, error } = useAlbums();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  let filteredAlbums = (albums as any[]).filter(album =>
    (album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.ucp?.includes(searchTerm)) &&
    (!filterStatus || album.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 p-4">
          <p className="text-red-600 text-sm font-medium">⚠️ Lỗi: {error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-card border-border p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader className="w-5 h-5 animate-spin text-accent" />
            <p className="text-muted-foreground">Đang tải albums...</p>
          </div>
        </Card>
      )}

      {!loading && (
        <>
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search albums, artist, UCP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Album
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border hover:border-accent/40'
                }`}
            >
              All
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === key
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border border-border hover:border-accent/40'
                  }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Albums Table */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-left text-sm font-bold">Album</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Artist</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">UCP</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Tracks</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Streams</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlbums.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        Không tìm thấy albums
                      </td>
                    </tr>
                  ) : (
                    filteredAlbums.map((album, idx) => {
                      const config = statusConfig[album.status as keyof typeof statusConfig];
                      return (
                        <tr
                          key={album.id}
                          className={`border-b border-border hover:bg-accent/5 transition-colors ${idx === filteredAlbums.length - 1 ? 'border-0' : ''
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center flex-shrink-0">
                                <Music className="w-5 h-5 text-accent/40" />
                              </div>
                              <p className="font-bold">{album.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{album.artist}</td>
                          <td className="px-6 py-4 font-mono text-sm">{album.ucp}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config?.color || 'bg-gray-500/20 text-gray-500'}`}>
                              {config?.label || album.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{album.tracks || '-'}</td>
                          <td className="px-6 py-4 text-accent font-bold">{((album.totalStreams || 0) / 1000).toFixed(1)}K</td>
                          <td className="px-6 py-4 text-right">
                            <button className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-background transition-colors">
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = (albums as any[]).filter(a => a.status === key).length;
              return (
                <Card key={key} className="bg-card border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2 uppercase">{config.label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
