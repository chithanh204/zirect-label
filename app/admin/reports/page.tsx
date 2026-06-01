'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';
import { Mail, Music, AlertTriangle, Calendar, FileText, CheckCircle, ExternalLink, Link as LinkIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'contracts' | 'discrepancies' | 'schedule'>('contracts');
  const [loading, setLoading] = useState(true);

  // Data states
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractsFilter, setContractsFilter] = useState<'all' | 'new' | 'reviewed'>('all');
  const [copyrightFlags, setCopyrightFlags] = useState<any[]>([]);
  const [missingLinks, setMissingLinks] = useState<any[]>([]);
  const [spotifyDiscrepancies, setSpotifyDiscrepancies] = useState<any[]>([]);
  const [releaseSchedule, setReleaseSchedule] = useState<any[]>([]);

  useEffect(() => {
    loadTabReportData();
  }, [activeTab]);

  const loadTabReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || undefined;

      if (activeTab === 'contracts') {
        const res: any = await apiClient.getContractReports(token);
        if (res && res.success) {
          setContracts(res.data || []);
        }
      } else if (activeTab === 'discrepancies') {
        const res: any = await apiClient.getDiscrepancyReports(token);
        if (res && res.success) {
          setCopyrightFlags(res.data?.copyrightFlags || []);
          setMissingLinks(res.data?.missingIds || []);
          setSpotifyDiscrepancies(res.data?.spotifyDiscrepancies || []);
        }
      } else if (activeTab === 'schedule') {
        const res: any = await apiClient.getReleaseScheduleReports(token);
        if (res && res.success) {
          setReleaseSchedule(res.data || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to load report data', err);
      toast({
        title: 'Error loading report',
        description: err.message || 'An error occurred while fetching report data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.updateContractStatus(id, 'reviewed', token);
      if (res && res.success) {
        toast({
          title: 'Status Updated',
          description: 'Submission marked as reviewed.',
        });
        // Reload contract reports locally without full reload
        setContracts(contracts.map(c => c.id === id ? { ...c, status: 'reviewed' } : c));
      }
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleDistribute = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken') || undefined;
      const res: any = await apiClient.updateAlbumStatus(id, 'distributed', undefined, token);
      if (res && res.success) {
        toast({
          title: 'Album Distributed',
          description: 'The album has been successfully distributed to live streaming stores.',
        });
        // Refresh report data
        loadTabReportData();
      }
    } catch (err: any) {
      toast({
        title: 'Distribution Failed',
        description: err.message || 'Failed to distribute album.',
        variant: 'destructive',
      });
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (contractsFilter === 'all') return true;
    return c.status === contractsFilter;
  });

  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.82)] pointer-events-none z-0" />
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">Label <span className="gradient-text-cyan">Reports</span></h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTabReportData}
                disabled={loading}
                className="self-start border-accent/25 hover:bg-accent/5"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Report
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-accent/10 gap-2 pb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('contracts')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-all outline-none whitespace-nowrap ${activeTab === 'contracts' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Mail className="w-4 h-4" />
                Artist Contracts ({contracts.filter(c => c.status === 'new').length} New)
              </button>
              <button
                onClick={() => setActiveTab('discrepancies')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-all outline-none whitespace-nowrap ${activeTab === 'discrepancies' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                Platform Discrepancies ({copyrightFlags.length + missingLinks.length + spotifyDiscrepancies.length} Flagged)
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-all outline-none whitespace-nowrap ${activeTab === 'schedule' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Calendar className="w-4 h-4" />
                Release Schedule ({releaseSchedule.length} Upcoming)
              </button>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">Generating report data...</div>
              ) : (
                <>
                  {/* Tab 1: Contract Inquiries */}
                  {activeTab === 'contracts' && (
                    <Card className="glass border-accent/15">
                      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4">
                        <div>
                          <CardTitle className="text-xl">Artist Contract Inquiries</CardTitle>
                        </div>
                        <div className="flex gap-1.5 self-start">
                          {(['all', 'new', 'reviewed'] as const).map((filter) => (
                            <Button
                              key={filter}
                              size="sm"
                              variant={contractsFilter === filter ? 'default' : 'outline'}
                              onClick={() => setContractsFilter(filter)}
                              className={`text-xs capitalize ${contractsFilter === filter ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'border-accent/20 hover:bg-accent/5'}`}
                            >
                              {filter}
                            </Button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {filteredContracts.length === 0 ? (
                          <div className="text-center py-16 text-muted-foreground">No contract submissions found.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-accent/10 text-xs font-semibold text-muted-foreground uppercase">
                                  <th className="py-3 px-4">Artist/Band</th>
                                  <th className="py-3 px-4">Email</th>
                                  <th className="py-3 px-4">Subject</th>
                                  <th className="py-3 px-4">Demo Link</th>
                                  <th className="py-3 px-4">Pitch Message</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-accent/5 text-sm">
                                {filteredContracts.map((c) => (
                                  <tr key={c.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="py-3 px-4 font-bold text-foreground">{c.artistName}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                                    <td className="py-3 px-4 text-foreground font-medium">{c.subject}</td>
                                    <td className="py-3 px-4">
                                      {c.demoLink ? (
                                        <a
                                          href={c.demoLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-accent hover:underline flex items-center gap-1 text-xs font-medium"
                                        >
                                          Listen Demo <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">No Link</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 max-w-xs truncate text-muted-foreground" title={c.message}>
                                      {c.message}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${c.status === 'new' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                        {c.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      {c.status === 'new' && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleMarkReviewed(c.id)}
                                          className="h-8 text-xs hover:bg-accent/15 hover:text-accent font-semibold"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                          Review
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Tab 2: Platform Discrepancies */}
                  {activeTab === 'discrepancies' && (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Section A: Copyright Issues */}
                      <Card className="glass border-accent/15">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Copyright Flags & Infringements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {copyrightFlags.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No active copyright flags reported.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-accent/10 text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="py-3 px-4">Track Title</th>
                                    <th className="py-3 px-4">Album Context</th>
                                    <th className="py-3 px-4">Platform</th>
                                    <th className="py-3 px-4">Total Streams</th>
                                    <th className="py-3 px-4">Platform Link</th>
                                    <th className="py-3 px-4 text-right">Severity</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-accent/5 text-sm">
                                  {copyrightFlags.map((flag) => (
                                    <tr key={flag.id} className="hover:bg-destructive/5 transition-colors">
                                      <td className="py-3 px-4 font-bold text-foreground">{flag.track?.title}</td>
                                      <td className="py-3 px-4 text-muted-foreground">{flag.track?.album?.title || 'Unknown'}</td>
                                      <td className="py-3 px-4 font-medium text-accent">{flag.platform}</td>
                                      <td className="py-3 px-4 text-foreground font-semibold">{flag.streams.toLocaleString()}</td>
                                      <td className="py-3 px-4">
                                        {flag.url ? (
                                          <a href={flag.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1 text-xs">
                                            Open URL <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">No Link</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 uppercase">
                                          High Alert
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Section B: Spotify Live Sync Discrepancies */}
                      <Card className="glass border-accent/15">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Music className="w-5 h-5 text-accent animate-pulse" />
                            Spotify Live Sync Discrepancies
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {spotifyDiscrepancies.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">All local albums perfectly match Spotify platform metadata!</div>
                          ) : (
                            <div className="overflow-x-auto font-sans">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-accent/10 text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="py-3 px-4">Album Info</th>
                                    <th className="py-3 px-4">Mismatched Field</th>
                                    <th className="py-3 px-4">Local Database Value</th>
                                    <th className="py-3 px-4">Spotify Live Value</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-accent/5 text-sm">
                                  {spotifyDiscrepancies.map((disc, idx) => (
                                    <tr key={disc.albumId + '-' + idx} className="hover:bg-accent/5 transition-colors">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          {disc.coverArt ? (
                                            <img src={disc.coverArt} alt={disc.title} className="w-10 h-10 rounded object-cover border border-accent/10" />
                                          ) : (
                                            <div className="w-10 h-10 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent">Art</div>
                                          )}
                                          <div>
                                            <div className="font-bold text-foreground">{disc.title}</div>
                                            <div className="text-xs text-muted-foreground">{disc.artistName}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1">
                                          {disc.mismatches.map((m: string) => (
                                            <span key={m} className="inline-block self-start px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                              {m === 'title' ? 'Album Title' : m === 'totalTracks' ? 'Track Count' : 'Display Artist'}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="space-y-1 text-xs">
                                          {disc.mismatches.includes('title') && (
                                            <div className="text-red-400 font-medium">Title: {disc.localValue.title}</div>
                                          )}
                                          {disc.mismatches.includes('totalTracks') && (
                                            <div className="text-red-400 font-medium">Tracks: {disc.localValue.totalTracks}</div>
                                          )}
                                          {disc.mismatches.includes('displayArtist') && (
                                            <div className="text-red-400 font-medium">Artist: {disc.localValue.displayArtist}</div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="space-y-1 text-xs">
                                          {disc.mismatches.includes('title') && (
                                            <div className="text-green-400 font-semibold">Title: {disc.spotifyValue.title}</div>
                                          )}
                                          {disc.mismatches.includes('totalTracks') && (
                                            <div className="text-green-400 font-semibold">Tracks: {disc.spotifyValue.totalTracks}</div>
                                          )}
                                          {disc.mismatches.includes('displayArtist') && (
                                            <div className="text-green-400 font-semibold">Artist: {disc.spotifyValue.displayArtist}</div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <a href={`https://open.spotify.com/album/${disc.spotifyAlbumId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium">
                                            View Spotify <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                          <Link href={`/admin/albums`}>
                                            <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-accent/15 text-accent font-semibold">
                                              Sync Local
                                            </Button>
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Section C: Missing IDs */}
                      <Card className="glass border-accent/15">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-accent" />
                            Missing Distribution IDs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {missingLinks.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">All distributed albums have platform sync IDs.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-accent/10 text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="py-3 px-4">Album Name</th>
                                    <th className="py-3 px-4">Main Artist</th>
                                    <th className="py-3 px-4">Spotify ID</th>
                                    <th className="py-3 px-4">YouTube ID</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-accent/5 text-sm">
                                  {missingLinks.map((album) => (
                                    <tr key={album.id} className="hover:bg-accent/5 transition-colors">
                                      <td className="py-3 px-4 font-bold text-foreground">{album.title}</td>
                                      <td className="py-3 px-4 text-muted-foreground">{album.artistName}</td>
                                      <td className="py-3 px-4">
                                        {album.albumId ? (
                                          <span className="text-green-400 font-medium text-xs">Present</span>
                                        ) : (
                                          <span className="text-destructive font-semibold text-xs uppercase">Missing</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4">
                                        {album.youtubeId ? (
                                          <span className="text-green-400 font-medium text-xs">Present</span>
                                        ) : (
                                          <span className="text-destructive font-semibold text-xs uppercase">Missing</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <Link href={`/admin/albums`}>
                                          <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-accent/15 text-accent font-semibold">
                                            Edit Album
                                          </Button>
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Tab 3: Release Schedule */}
                  {activeTab === 'schedule' && (
                    <Card className="glass border-accent/15">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-accent" />
                          Upcoming Release Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {releaseSchedule.length === 0 ? (
                          <div className="text-center py-16 text-muted-foreground">No upcoming scheduled releases found.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-accent/10 text-xs font-semibold text-muted-foreground uppercase">
                                  <th className="py-3 px-4">Scheduled Date</th>
                                  <th className="py-3 px-4">Album Title</th>
                                  <th className="py-3 px-4">Main Artist</th>
                                  <th className="py-3 px-4">UPC / Barcode</th>
                                  <th className="py-3 px-4 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-accent/5 text-sm">
                                {releaseSchedule.map((album) => {
                                  const isOverdue = album.status === 'approved' && new Date(album.releaseDate) <= new Date();
                                  return (
                                    <tr key={album.id} className={`hover:bg-accent/5 transition-colors ${isOverdue ? 'bg-destructive/5 hover:bg-destructive/10' : ''}`}>
                                      <td className="py-3 px-4 font-bold text-accent">
                                        {new Date(album.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="font-bold text-foreground flex items-center gap-2">
                                          {album.title}
                                          {isOverdue && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse font-bold uppercase" title="Release Overdue / Ready to Distribute">
                                              <AlertTriangle className="w-3 h-3" /> Overdue
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-muted-foreground">{album.artistName}</td>
                                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{album.upc || 'N/A'}</td>
                                      <td className="py-3 px-4 text-right flex items-center justify-end gap-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${album.status === 'submitted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                          {album.status}
                                        </span>
                                        {isOverdue && (
                                          <Button
                                            size="sm"
                                            onClick={() => handleDistribute(album.id)}
                                            className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 text-xs font-bold neon-glow-sm"
                                          >
                                            Distribute Now
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
