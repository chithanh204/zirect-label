'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  DollarSign, 
  Copy, 
  Check, 
  ArrowRight, 
  Coins, 
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Loader2
} from 'lucide-react';

export default function AdminRevenuePage() {
  const { toast } = useToast();
  
  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Import Excel states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [paymentMonth, setPaymentMonth] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Artist Payout states
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  
  // Payout details states
  const [unpaidAlbums, setUnpaidAlbums] = useState<any[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    transactionId: '',
    note: '',
    receiptUrl: '',
  });
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Load Artist Payments Summary
  const fetchArtistsSummary = async () => {
    try {
      setIsLoadingArtists(true);
      const res = await apiClient.getArtistPaymentSummaryAdmin() as any;
      if (res && res.success) {
        setArtists(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to load artist payments summary.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingArtists(false);
    }
  };

  useEffect(() => {
    fetchArtistsSummary();
  }, []);

  // Drag & Drop Handlers for Import Excel
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelFile(file);
      } else {
        toast({
          title: 'Invalid Format',
          description: 'Please upload only Excel spreadsheets (.xlsx, .xls).',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!excelFile) return;
    if (!paymentMonth) {
      toast({
        title: 'Month Required',
        description: 'Please select the payment/billing month for this revenue report.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      setImportResult(null);
      const res = await apiClient.importRevenueExcel(excelFile, paymentMonth) as any;
      if (res && res.success) {
        setImportResult(res.data);
        setExcelFile(null);
        setPaymentMonth('');
        toast({
          title: 'Import Successful!',
          description: `Distributed revenue for ${res.data.processedRows} tracks from report.`,
        });
        fetchArtistsSummary(); // Refresh background data!
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Import Failed',
        description: err.message || 'An error occurred during file parsing.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Open Payout Modal
  const handleOpenPayout = async (artist: any) => {
    setSelectedArtist(artist);
    setIsPayoutModalOpen(true);
    setUnpaidAlbums([]);
    setPayoutForm({ transactionId: '', note: '', receiptUrl: '' });
    
    try {
      setIsLoadingAlbums(true);
      const res = await apiClient.getArtistUnpaidAlbums(artist.id) as any;
      if (res && res.success) {
        setUnpaidAlbums(res.data.unpaidAlbums || []);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to load unpaid album breakdowns.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  // Approve PayPal Account
  const handleVerifyPayPal = async (artistId: string) => {
    try {
      const res = await apiClient.verifyPayPalAdmin(artistId) as any;
      if (res && res.success) {
        toast({
          title: 'PayPal Verified',
          description: 'Artist PayPal account verified successfully.',
        });
        fetchArtistsSummary();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Verification Failed',
        description: err.message || 'Failed to verify PayPal account.',
        variant: 'destructive',
      });
    }
  };

  // Copy Clipboard Helper
  const copyToClipboard = (text: string, type: 'email' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
    toast({
      title: 'Copied!',
      description: `${type === 'email' ? 'PayPal email' : 'Amount'} copied to clipboard.`,
    });
  };

  // Upload Payment Receipt Screenshot
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsReceiptUploading(true);
        const res = await apiClient.uploadImage(file, 'zirect/receipts');
        if (res && res.success) {
          setPayoutForm(prev => ({ ...prev, receiptUrl: res.data.url }));
          toast({
            title: 'Upload Successful',
            description: 'Payment receipt uploaded successfully.',
          });
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: 'Upload Failed',
          description: err.message || 'Failed to upload receipt.',
          variant: 'destructive',
        });
      } finally {
        setIsReceiptUploading(false);
      }
    }
  };

  // Confirm Payout
  const handleConfirmPayout = async () => {
    if (!payoutForm.transactionId) {
      toast({
        title: 'Missing Field',
        description: 'Please input the PayPal Transaction ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessingPayout(true);
      const res = await apiClient.processPayout({
        artistId: selectedArtist.id,
        amount: selectedArtist.balance,
        paypalAccount: selectedArtist.paypalAccount,
        transactionId: payoutForm.transactionId,
        receiptUrl: payoutForm.receiptUrl,
        note: payoutForm.note,
      }) as any;

      if (res && res.success) {
        toast({
          title: 'Payout Processed!',
          description: `Successfully paid £${selectedArtist.balance.toFixed(2)} to ${selectedArtist.name}.`,
        });
        setIsPayoutModalOpen(false);
        fetchArtistsSummary();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Payout Failed',
        description: err.message || 'An error occurred during payment processing.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  return (
    <div className="flex h-screen art-bg-admin">
      <div className="fixed inset-0 bg-[rgba(2,8,23,0.85)] pointer-events-none z-0" />
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-accent/15 pb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">
                  Artist <span className="gradient-text-cyan">Payments & Revenue</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Verify artist PayPal details, parse revenue reports, and process manual payouts.
                </p>
              </div>
              <Button
                onClick={() => {
                  setImportResult(null);
                  setExcelFile(null);
                  setPaymentMonth('');
                  setIsImportModalOpen(true);
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm font-semibold flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Import Excel Report
              </Button>
            </div>

            {/* Main Payouts Table */}
            <div className="glass rounded-xl overflow-hidden border border-accent/10">
              {isLoadingArtists ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <span>Loading payment summary...</span>
                </div>
              ) : artists.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No artist payout accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[rgba(8,20,45,0.4)] text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-accent/10">
                        <th className="px-6 py-4">Artist</th>
                        <th className="px-6 py-4">PayPal Email</th>
                        <th className="px-6 py-4 text-center">PayPal Status</th>
                        <th className="px-6 py-4 text-right">Lifetime Earned</th>
                        <th className="px-6 py-4 text-right">Total Paid</th>
                        <th className="px-6 py-4 text-right text-accent">Unpaid Balance</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/10 text-sm">
                      {artists.map((artist) => (
                        <tr key={artist.id} className="hover:bg-accent/5 transition-colors">
                          {/* Profile */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-accent/20 overflow-hidden shrink-0">
                                {artist.avatar ? (
                                  <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-accent/10 flex items-center justify-center text-xs text-accent">
                                    {artist.name[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-foreground">{artist.name}</div>
                                <div className="text-xs text-muted-foreground">{artist.email}</div>
                              </div>
                            </div>
                          </td>
                          {/* PayPal Account */}
                          <td className="px-6 py-4 font-mono text-xs">
                            {artist.paypalAccount || (
                              <span className="text-muted-foreground/60 italic">Not Linked</span>
                            )}
                          </td>
                          {/* Verification Status */}
                          <td className="px-6 py-4 text-center">
                            {artist.paypalAccount ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                artist.paymentVerificationStatus === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {artist.paymentVerificationStatus === 'verified' ? 'Verified' : 'Pending Approval'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                Unlinked
                              </span>
                            )}
                          </td>
                          {/* Financials */}
                          <td className="px-6 py-4 text-right font-semibold">£{artist.totalRevenue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-muted-foreground">£{artist.totalPaid.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-bold text-accent">£{artist.balance.toFixed(2)}</td>
                          {/* Action Button */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {artist.paypalAccount && artist.paymentVerificationStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyPayPal(artist.id)}
                                  className="bg-amber-500 text-black hover:bg-amber-600 text-xs px-2.5 py-1 h-auto"
                                >
                                  Approve PayPal
                                </Button>
                              )}
                              <Button
                                size="sm"
                                disabled={artist.balance <= 0 || !artist.paypalAccount}
                                onClick={() => handleOpenPayout(artist)}
                                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-3 py-1 h-auto neon-glow-sm"
                              >
                                Process Pay
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================================== MODAL: IMPORT EXCEL ================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          
          <div className="glass rounded-2xl w-full max-w-2xl overflow-hidden border border-accent/20 relative z-10 neon-border animate-in scale-in duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-accent/15 flex items-center justify-between bg-[rgba(8,20,45,0.4)]">
              <div>
                <h3 className="text-xl font-bold">Import Distributor Report</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Parse distributor spreadsheets to allocate streams & royalty splits.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {importResult ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                    <h4 className="text-lg font-bold">Report Parsed & Distributed Successfully!</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Rows Processed</p>
                      <p className="text-2xl font-extrabold text-accent mt-1">{importResult.processedRows}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Distributed Royalty</p>
                      <p className="text-2xl font-extrabold mt-1 text-emerald-400">£{importResult.totalRoyaltyDistributed.toFixed(2)}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Artists Credited</p>
                      <p className="text-2xl font-extrabold text-accent mt-1">{importResult.affectedArtists}</p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Streams Updated</p>
                      <p className="text-2xl font-extrabold text-accent mt-1">{importResult.totalStreamsAdded.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setIsImportModalOpen(false)} className="bg-accent text-accent-foreground px-6">
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* File Upload Zone */}
                  <div className="md:col-span-2 space-y-4">
                    {/* Month Picker */}
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">
                        Select Payment/Billing Month <span className="text-accent">*</span>
                      </label>
                      <Input
                        type="month"
                        required
                        value={paymentMonth}
                        onChange={(e) => setPaymentMonth(e.target.value)}
                        className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40 text-sm w-full"
                      />
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
                        isDragging 
                          ? 'border-accent bg-accent/5 neon-border' 
                          : 'border-accent/25 bg-[rgba(8,20,45,0.2)] hover:border-accent/40'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="hidden"
                      />
                      
                      <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mb-4 text-accent">
                        <Upload className="w-6 h-6" />
                      </div>

                      {excelFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-1.5 text-foreground text-sm font-bold">
                            <FileSpreadsheet className="w-4 h-4 text-accent" />
                            <span className="truncate max-w-[180px]">{excelFile.name}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {(excelFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex justify-center gap-2 pt-2">
                            <Button 
                              variant="outline"
                              onClick={() => setExcelFile(null)}
                              className="border-accent/20 hover:bg-accent/5 text-foreground h-8 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleImportSubmit}
                              disabled={isUploading}
                              className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 h-8 text-xs neon-glow-sm"
                            >
                              {isUploading ? 'Importing...' : 'Upload & Parse'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-sm">Drag & drop report spreadsheet here</p>
                          <p className="text-xs text-muted-foreground">
                            Or browse files from your computer (.xlsx, .xls)
                          </p>
                          <div className="pt-4">
                            <Button 
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-accent/10 border border-accent/20 hover:bg-accent/20 text-foreground text-xs px-4 h-8"
                            >
                              Browse Spreadsheets
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schema Info */}
                  <div className="glass-card rounded-xl p-4 border border-accent/10 space-y-3 text-xs">
                    <h4 className="font-bold text-accent">Required Columns</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      The parser matches columns dynamically. Please make sure the report has:
                    </p>
                    <ul className="space-y-2 leading-relaxed">
                      <li className="flex items-start gap-1">
                        <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                        <span><strong>ISRC:</strong> Core code to match songs in database.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                        <span><strong>Royalty (£) / Revenue:</strong> Amount of payout received.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                        <span><strong>Units / Streams:</strong> Total stream counts.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================== MODAL: PROCESS PAYOUT ================================== */}
      {isPayoutModalOpen && selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsPayoutModalOpen(false)} />
          
          <div className="glass rounded-2xl w-full max-w-3xl overflow-hidden border border-accent/20 relative z-10 neon-border animate-in scale-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-accent/15 flex items-center justify-between bg-[rgba(8,20,45,0.4)]">
              <div>
                <h3 className="text-xl font-bold">Process Payout</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Artist: {selectedArtist.name}</p>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Copy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4 flex items-center justify-between border border-accent/15">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">PayPal Email Account</p>
                    <p className="font-mono text-sm font-semibold truncate text-foreground">{selectedArtist.paypalAccount}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedArtist.paypalAccount, 'email')}
                    className="hover:bg-accent/10 hover:text-accent h-8 w-8 p-0"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="glass-card rounded-xl p-4 flex items-center justify-between border border-accent/15 bg-accent/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-wider">Unpaid Amount Due</p>
                    <p className="text-xl font-black text-accent">£{selectedArtist.balance.toFixed(2)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedArtist.balance.toFixed(2), 'amount')}
                    className="hover:bg-accent/10 hover:text-accent h-8 w-8 p-0"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Unpaid Albums detail */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Revenue Allocation by Album</h4>
                <div className="border border-accent/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {isLoadingAlbums ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">Loading albums details...</div>
                  ) : unpaidAlbums.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">No pending balances allocated to specific albums.</div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[rgba(8,20,45,0.3)] text-muted-foreground border-b border-accent/10">
                          <th className="px-4 py-2.5">Album</th>
                          <th className="px-4 py-2.5 text-center">Split (%)</th>
                          <th className="px-4 py-2.5 text-right">Share Earned</th>
                          <th className="px-4 py-2.5 text-right text-accent font-bold">Unpaid Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-accent/10">
                        {unpaidAlbums.map((album) => (
                          <tr key={album.albumId} className="hover:bg-accent/5">
                            <td className="px-4 py-2 flex items-center gap-2">
                              <div className="w-6 h-6 border border-accent/20 rounded overflow-hidden shrink-0">
                                {album.coverArt ? (
                                  <img src={album.coverArt} alt={album.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-accent/10" />
                                )}
                              </div>
                              <span className="font-bold truncate text-foreground">{album.title}</span>
                            </td>
                            <td className="px-4 py-2 text-center">{album.percentage}%</td>
                            <td className="px-4 py-2 text-right">£{album.share.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-bold text-accent">£{album.unpaid.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 pt-4 border-t border-accent/10">
                <h4 className="text-sm font-bold text-foreground">Transaction Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Transaction ID */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">
                      PayPal Transaction ID <span className="text-accent">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. 5HA1234567890123L"
                      value={payoutForm.transactionId}
                      onChange={(e) => setPayoutForm(prev => ({ ...prev, transactionId: e.target.value }))}
                      className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40 text-sm"
                    />
                  </div>

                  {/* Upload Receipt screenshot */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">
                      Upload Receipt Screenshot
                    </label>
                    <input
                      type="file"
                      ref={receiptInputRef}
                      onChange={handleReceiptUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    
                    {payoutForm.receiptUrl ? (
                      <div className="flex items-center justify-between gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Receipt Loaded</span>
                        </span>
                        <button
                          onClick={() => setPayoutForm(prev => ({ ...prev, receiptUrl: '' }))}
                          className="text-red-400 hover:text-red-500 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => receiptInputRef.current?.click()}
                        disabled={isReceiptUploading}
                        className="w-full bg-[rgba(8,20,45,0.4)] hover:bg-accent/10 border border-accent/15 hover:border-accent/30 text-foreground text-xs h-9 justify-center flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-4 h-4 text-accent" />
                        <span>{isReceiptUploading ? 'Uploading Image...' : 'Upload Receipt Link'}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Payment Notes</label>
                  <Textarea
                    placeholder="Enter descriptive transaction reference or payouts details..."
                    value={payoutForm.note}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, note: e.target.value }))}
                    className="bg-[rgba(8,20,45,0.4)] border-accent/15 focus:border-accent/40 text-xs min-h-16 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-accent/15 flex justify-end gap-3 bg-[rgba(8,20,45,0.2)]">
              <Button
                variant="outline"
                onClick={() => setIsPayoutModalOpen(false)}
                className="border-accent/20 hover:bg-accent/5 text-foreground text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayout}
                disabled={isProcessingPayout || !payoutForm.transactionId}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold neon-glow-sm px-6"
              >
                {isProcessingPayout ? 'Processing...' : 'Confirm Paid'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
