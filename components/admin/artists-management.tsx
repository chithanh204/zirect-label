'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, MoreVertical, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

const artistsList = [
  {
    id: 1,
    name: 'Luna Echo',
    email: 'luna@example.com',
    status: 'active',
    albums: 3,
    totalStreams: 145000,
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'City Beats',
    email: 'city@example.com',
    status: 'active',
    albums: 2,
    totalStreams: 98500,
    joinDate: '2024-02-10'
  },
  {
    id: 3,
    name: 'Tropical Waves',
    email: 'tropical@example.com',
    status: 'active',
    albums: 1,
    totalStreams: 76300,
    joinDate: '2024-02-28'
  },
  {
    id: 4,
    name: 'Cosmic Sound',
    email: 'cosmic@example.com',
    status: 'inactive',
    albums: 0,
    totalStreams: 0,
    joinDate: '2024-03-05'
  }
];

export function ArtistsManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtists = artistsList.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Artist
        </Button>
      </div>

      {/* Artists Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-left text-sm font-bold">Artist Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Albums</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Total Streams</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtists.map((artist, idx) => (
                <tr
                  key={artist.id}
                  className={`border-b border-border hover:bg-accent/5 transition-colors ${
                    idx === filteredArtists.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold">{artist.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {artist.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      artist.status === 'active'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {artist.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{artist.albums}</td>
                  <td className="px-6 py-4 text-accent font-bold">{(artist.totalStreams / 1000).toFixed(1)}K</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(artist.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-background transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Artists</p>
          <p className="text-2xl font-bold">{artistsList.length}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Artists</p>
          <p className="text-2xl font-bold text-green-500">{artistsList.filter(a => a.status === 'active').length}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Streams (All)</p>
          <p className="text-2xl font-bold text-accent">
            {(artistsList.reduce((sum, a) => sum + a.totalStreams, 0) / 1000000).toFixed(2)}M
          </p>
        </Card>
      </div>
    </div>
  );
}
