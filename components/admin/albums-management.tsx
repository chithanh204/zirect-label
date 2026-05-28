'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Music, CheckCircle, AlertCircle, Clock, Loader2, X, ImageIcon, Check, Edit, Eye, Trash2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAlbums } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  draft: { label: 'Making cover art', icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  submitted: { label: 'Submitted', icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-cyan-500', bgColor: 'bg-cyan-500/20' },
  distributed: { label: 'Distributed', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
};

const isStatusDisabled = (current: string, option: string) => {
  const order = ['draft', 'submitted', 'approved', 'distributed'];
  if (current === 'rejected') return option !== 'submitted';
  if (option === 'rejected') return current !== 'submitted' && current !== 'approved';

  const currentIndex = order.indexOf(current);
  const optionIndex = order.indexOf(option);

  if (currentIndex === -1 || optionIndex === -1) return false;
  return optionIndex < currentIndex;
};

export function AlbumsManagement() {
  const { albums, loading, error, refetch } = useAlbums();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeDropdownAlbumId, setActiveDropdownAlbumId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownAlbumId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Create album dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status update dialog
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{ albumId: string; albumTitle: string; newStatus: string } | null>(null);
  const [statusUpdateFields, setStatusUpdateFields] = useState<any>({});

  // Edit album dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAlbumData, setEditAlbumData] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Artists list for dropdown
  const [artistsList, setArtistsList] = useState<any[]>([]);

  // Primary Artists state (multiple system/custom)
  const [createPrimaryArtists, setCreatePrimaryArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([
    { type: 'system', id: '', name: '' }
  ]);
  const [editPrimaryArtists, setEditPrimaryArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);

  // Featuring Artists state (multiple system/custom)
  const [createFeaturingArtists, setCreateFeaturingArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);
  const [editFeaturingArtists, setEditFeaturingArtists] = useState<Array<{ type: 'system' | 'custom'; id: string; name: string }>>([]);

  const createPrimaryFirstRun = useRef(true);
  const prevCreatePrimaryStr = useRef('');
  const editPrimaryFirstRun = useRef(true);
  const prevEditPrimaryStr = useRef('');

  // Form state - full metadata matching Edit Album Metadata dialog
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    albumId: '',       // Spotify Album ID
    youtubeId: '',     // YouTube Music ID
    coverArt: '',
    releaseDate: '',
    upc: '',
    displayArtist: '',
    primaryArtists: '',
    featuringArtists: '',
    pYear: new Date().getFullYear(),
    cYear: new Date().getFullYear(),
    pLine: 'Zirect Label',
    cLine: 'Zirect Label',
    genre: '',
    subgenre: '',
  });

  // Fetch artists for the dropdown
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await apiClient.getAllArtists() as any;
        if (response?.success && response.data) {
          setArtistsList(response.data.artists || []);
        }
      } catch (e) {
        console.error('Failed to fetch artists for dropdown:', e);
      }
    };
    fetchArtists();
  }, []);

  // Synchronize displayArtist with primary artists on Create Album Dialog
  useEffect(() => {
    const primaryArtistsStr = createPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');

    if (createPrimaryFirstRun.current) {
      createPrimaryFirstRun.current = false;
      prevCreatePrimaryStr.current = primaryArtistsStr;
      return;
    }

    if (!formData.displayArtist || formData.displayArtist === prevCreatePrimaryStr.current) {
      setFormData(prev => ({ ...prev, displayArtist: primaryArtistsStr }));
    }
    prevCreatePrimaryStr.current = primaryArtistsStr;
  }, [createPrimaryArtists]);

  // Synchronize displayArtist with primary artists on Edit Album Dialog
  useEffect(() => {
    const primaryArtistsStr = editPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');

    if (editPrimaryFirstRun.current) {
      editPrimaryFirstRun.current = false;
      prevEditPrimaryStr.current = primaryArtistsStr;
      return;
    }

    if (!editForm.displayArtist || editForm.displayArtist === prevEditPrimaryStr.current) {
      setEditForm((prev: any) => ({ ...prev, displayArtist: primaryArtistsStr }));
    }
    prevEditPrimaryStr.current = primaryArtistsStr;
  }, [editPrimaryArtists]);

  const filteredAlbums = albums.filter((album: any) =>
    (album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.displayArtist?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterStatus || album.status === filterStatus)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateCreateArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = createPrimaryArtists.some((a, i) => i !== index && a.type === 'system' && a.id == value);
      if (isDuplicate) {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Primary Artist! Vui lòng không chọn trùng.`);
        setCreatePrimaryArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setCreatePrimaryArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const updateCreateFeaturingArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = createFeaturingArtists.some((a, i) => i !== index && a.type === 'system' && a.id == value);
      if (isDuplicate) {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Featuring Artist! Vui lòng không chọn trùng.`);
        setCreateFeaturingArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setCreateFeaturingArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const updateEditArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = editPrimaryArtists.some((a, i) => i !== index && a.type === 'system' && a.id == value);
      if (isDuplicate) {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Primary Artist! Vui lòng không chọn trùng.`);
        setEditPrimaryArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setEditPrimaryArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const updateEditFeaturingArtistItem = (index: number, type: 'system' | 'custom', value: string) => {
    if (type === 'system' && value) {
      const isDuplicate = editFeaturingArtists.some((a, i) => i !== index && a.type === 'system' && a.id == value);
      if (isDuplicate) {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        alert(`Nghệ sĩ "${sysArtist ? sysArtist.name : ''}" đã được chọn làm Featuring Artist! Vui lòng không chọn trùng.`);
        setEditFeaturingArtists(prev => {
          const next = [...prev];
          next[index] = { type: 'system', id: '', name: '' };
          return next;
        });
        return;
      }
    }
    setEditFeaturingArtists(prev => {
      const next = [...prev];
      if (type === 'system') {
        const sysArtist = artistsList.find((a: any) => a.id == value || a._id == value);
        next[index] = {
          type: 'system',
          id: value,
          name: sysArtist ? sysArtist.name : '',
        };
      } else {
        next[index] = {
          type: 'custom',
          id: '',
          name: value,
        };
      }
      return next;
    });
  };

  const handleImageUpload = async (
    file: File,
    setPreview: (url: string | null) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    onSuccess: (url: string) => void
  ) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận tệp JPG hoặc PNG.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Kích thước tệp quá lớn. Tối đa 15MB.');
      return;
    }

    setLoading(true);
    setError(null);

    // Validate dimensions and aspect ratio (width/height >= 2000px, 1:1 ratio)
    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Không thể tải ảnh để kiểm tra chất lượng.'));
        };
      });

      if (dimensions.width < 2000 || dimensions.height < 2000) {
        setError(`Ảnh bìa phải có kích thước tối thiểu là 2000x2000px (Kích thước hiện tại: ${dimensions.width}x${dimensions.height}px).`);
        setLoading(false);
        return;
      }

      if (dimensions.width !== dimensions.height) {
        setError(`Ảnh bìa phải là hình vuông (tỷ lệ 1:1). Tỷ lệ hiện tại: ${dimensions.width}x${dimensions.height}px.`);
        setLoading(false);
        return;
      }
    } catch (e) {
      setError('Không thể xác thực kích thước của ảnh bìa.');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const response = await apiClient.uploadImage(file, 'zirect/covers');
      if (response?.success && response.data) {
        onSuccess(response.data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải lên ảnh bìa.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Cover art upload
  const handleFileSelect = useCallback(async (file: File) => {
    await handleImageUpload(file, setCoverPreview, setIsUploading, setSubmitError, (url) => {
      setFormData(prev => ({ ...prev, coverArt: url }));
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Cover art upload for edit
  const handleEditFileSelect = useCallback(async (file: File) => {
    await handleImageUpload(file, setEditCoverPreview, setIsEditUploading, setEditError, (url) => {
      setEditForm((prev: any) => ({ ...prev, coverArt: url }));
    });
  }, []);

  const handleEditDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleEditFileSelect(file);
  }, [handleEditFileSelect]);

  const removeCover = () => {
    setCoverPreview(null);
    setFormData(prev => ({ ...prev, coverArt: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    createPrimaryFirstRun.current = true;
    prevCreatePrimaryStr.current = '';
    setFormData({
      title: '', artistId: '', albumId: '', youtubeId: '', coverArt: '', releaseDate: '', upc: '',
      displayArtist: '', primaryArtists: '', featuringArtists: '',
      pYear: new Date().getFullYear(), cYear: new Date().getFullYear(),
      pLine: 'Zirect Label', cLine: 'Zirect Label', genre: '', subgenre: '',
    });
    setCreatePrimaryArtists([{ type: 'system', id: '', name: '' }]);
    setCreateFeaturingArtists([]);
    setCoverPreview(null);
    setSubmitError(null);
  };

  const removeEditCover = () => {
    setEditCoverPreview(null);
    setEditForm((prev: any) => ({ ...prev, coverArt: '' }));
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleOpenEditDialog = (album: any) => {
    editPrimaryFirstRun.current = true;
    prevEditPrimaryStr.current = '';
    setEditAlbumData(album);
    setEditForm({
      title: album.title || '',
      upc: album.upc || '',
      albumId: album.albumId || '',
      youtubeId: album.youtubeId || '',
      releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
      coverArt: album.coverArt || '',
      displayArtist: album.displayArtist || '',
      featuringArtists: album.featuringArtists || '',
      pYear: album.pYear || new Date().getFullYear(),
      cYear: album.cYear || new Date().getFullYear(),
      pLine: album.pLine || 'Zirect Label',
      cLine: album.cLine || 'Zirect Label',
      genre: album.genre || '',
      subgenre: album.subgenre || '',
    });

    const parsedList: Array<{ type: 'system' | 'custom'; id: string; name: string }> = [];
    if (album.primaryArtists) {
      const names = album.primaryArtists.split(',').map((n: string) => n.trim()).filter(Boolean);
      names.forEach((name: string) => {
        const sysArtist = artistsList.find((a: any) => a.name.toLowerCase() === name.toLowerCase());
        if (sysArtist) {
          parsedList.push({ type: 'system', id: sysArtist.id || sysArtist._id, name: sysArtist.name });
        } else {
          parsedList.push({ type: 'custom', id: '', name });
        }
      });
    }

    if (parsedList.length === 0 && album.artistId) {
      parsedList.push({ type: 'system', id: album.artistId, name: album.artistName });
    }

    if (parsedList.length === 0) {
      parsedList.push({ type: 'system', id: '', name: '' });
    }

    setEditPrimaryArtists(parsedList);

    const parsedFeatList: Array<{ type: 'system' | 'custom'; id: string; name: string }> = [];
    if (album.featuringArtists) {
      const names = album.featuringArtists.split(',').map((n: string) => n.trim()).filter(Boolean);
      names.forEach((name: string) => {
        const sysArtist = artistsList.find((a: any) => a.name.toLowerCase() === name.toLowerCase());
        if (sysArtist) {
          parsedFeatList.push({ type: 'system', id: sysArtist.id || sysArtist._id, name: sysArtist.name });
        } else {
          parsedFeatList.push({ type: 'custom', id: '', name });
        }
      });
    }
    setEditFeaturingArtists(parsedFeatList);

    setEditCoverPreview(null);
    setEditError(null);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsEditSubmitting(true);

    try {
      const primaryArtistsStr = editPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');
      const featuringArtistsStr = editFeaturingArtists.map(a => a.name.trim()).filter(Boolean).join(', ') || null;
      const firstSystemArtist = editPrimaryArtists.find(a => a.type === 'system' && a.id);

      if (!firstSystemArtist) {
        setEditError('Vui lòng chọn ít nhất một nghệ sĩ trong hệ thống làm Primary Artist.');
        setIsEditSubmitting(false);
        return;
      }

      // Check duplicate featuring artists
      const featArtistNames = editFeaturingArtists.map(a => a.name.trim().toLowerCase()).filter(Boolean);
      const uniqueFeatNames = new Set(featArtistNames);
      if (featArtistNames.length !== uniqueFeatNames.size) {
        setEditError('Danh sách Featuring Artists không được chứa nghệ sĩ trùng lặp.');
        setIsEditSubmitting(false);
        return;
      }

      if (!editForm.title) {
        setEditError('Title is required');
        setIsEditSubmitting(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const pYear = editForm.pYear ? parseInt(editForm.pYear.toString()) : currentYear;
      const cYear = editForm.cYear ? parseInt(editForm.cYear.toString()) : currentYear;
      const pLine = editForm.pLine?.trim() || 'Zirect Label';
      const cLine = editForm.cLine?.trim() || 'Zirect Label';
      const displayArtist = editForm.displayArtist?.trim() || primaryArtistsStr;

      const updateData: any = { status: editAlbumData.status };

      updateData.title = editForm.title;
      updateData.upc = editForm.upc || null;
      updateData.albumId = editForm.albumId || null;
      updateData.youtubeId = editForm.youtubeId || null;
      if (editForm.releaseDate) updateData.releaseDate = editForm.releaseDate;
      updateData.coverArt = editForm.coverArt || null;

      // Update main ownership artist
      updateData.artistId = firstSystemArtist.id;
      updateData.artistName = firstSystemArtist.name;

      // Update metadata fields
      updateData.primaryArtists = primaryArtistsStr;
      updateData.displayArtist = displayArtist;
      updateData.featuringArtists = featuringArtistsStr;
      updateData.pYear = pYear;
      updateData.cYear = cYear;
      updateData.pLine = pLine;
      updateData.cLine = cLine;
      updateData.genre = editForm.genre || null;
      updateData.subgenre = editForm.subgenre || null;

      const res = await apiClient.updateAlbumStatus(editAlbumData.id, editAlbumData.status, updateData) as any;
      if (res?.success) {
        setIsEditDialogOpen(false);
        refetch();
      } else {
        setEditError(res?.message || 'Failed to update album');
      }
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to update album');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleActionChange = (action: string, album: any) => {
    if (action === 'view') {
      window.location.href = `/admin/albums/${album.id}`;
    } else if (action === 'edit') {
      handleOpenEditDialog(album);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const primaryArtistsStr = createPrimaryArtists.map(a => a.name.trim()).filter(Boolean).join(', ');
      const firstSystemArtist = createPrimaryArtists.find(a => a.type === 'system' && a.id);

      // Check duplicate primary artists
      const artistNames = createPrimaryArtists.map(a => a.name.trim().toLowerCase()).filter(Boolean);
      const uniqueNames = new Set(artistNames);
      if (artistNames.length !== uniqueNames.size) {
        setSubmitError('Danh sách Primary Artists không được chứa nghệ sĩ trùng lặp.');
        setIsSubmitting(false);
        return;
      }

      const featuringArtistsStr = createFeaturingArtists.map(a => a.name.trim()).filter(Boolean).join(', ') || null;

      // Check duplicate featuring artists
      const featArtistNames = createFeaturingArtists.map(a => a.name.trim().toLowerCase()).filter(Boolean);
      const uniqueFeatNames = new Set(featArtistNames);
      if (featArtistNames.length !== uniqueFeatNames.size) {
        setSubmitError('Danh sách Featuring Artists không được chứa nghệ sĩ trùng lặp.');
        setIsSubmitting(false);
        return;
      }

      if (!firstSystemArtist) {
        setSubmitError('Vui lòng chọn ít nhất một nghệ sĩ trong hệ thống làm Primary Artist.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.title) {
        setSubmitError('Title is required');
        setIsSubmitting(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const pYear = formData.pYear ? parseInt(formData.pYear.toString()) : currentYear;
      const cYear = formData.cYear ? parseInt(formData.cYear.toString()) : currentYear;
      const pLine = formData.pLine?.trim() || 'Zirect Label';
      const cLine = formData.cLine?.trim() || 'Zirect Label';
      const displayArtist = formData.displayArtist?.trim() || primaryArtistsStr;

      const response = await apiClient.createAlbumAdmin({
        title: formData.title,
        artistId: firstSystemArtist.id,
        coverArt: formData.coverArt || undefined,
        releaseDate: formData.releaseDate || undefined,
        upc: formData.upc || undefined,
        albumId: formData.albumId || undefined,
        youtubeId: formData.youtubeId || undefined,
        displayArtist: displayArtist || undefined,
        primaryArtists: primaryArtistsStr || undefined,
        featuringArtists: featuringArtistsStr || undefined,
        pYear: pYear || undefined,
        cYear: cYear || undefined,
        pLine: pLine || undefined,
        cLine: cLine || undefined,
        genre: formData.genre || undefined,
        subgenre: formData.subgenre || undefined,
      });

      if (response && (response as any).success) {
        resetForm();
        setIsCreateDialogOpen(false);
        refetch();
      } else {
        setSubmitError((response as any).message || 'Failed to create album');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create album');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (album: any, newStatus: string) => {
    if (newStatus === 'submitted' || newStatus === 'approved' || newStatus === 'distributed' || newStatus === 'rejected') {
      setStatusUpdateData({
        albumId: album.id,
        albumTitle: album.title,
        newStatus: newStatus,
      });
      setStatusUpdateFields({});
      setIsStatusUpdateDialogOpen(true);
    } else {
      await submitStatusUpdate(album.id, newStatus, {});
    }
  };

  const submitStatusUpdate = async (albumId: string, newStatus: string, fields: any) => {
    try {
      const updateData: any = { status: newStatus };
      if (fields.upc) updateData.upc = fields.upc;
      if (fields.albumId) updateData.albumId = fields.albumId;
      if (fields.youtubeId) updateData.youtubeId = fields.youtubeId;
      if (fields.rejectionReason) updateData.rejectionReason = fields.rejectionReason;

      const res = await apiClient.updateAlbumStatus(albumId, newStatus, updateData) as any;
      if (res?.success) {
        refetch();
        setIsStatusUpdateDialogOpen(false);
      } else {
        alert(res?.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search albums, artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Album
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card w-[95vw] max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col !p-5">
            <DialogHeader className="flex-shrink-0 pb-3 border-b border-border">
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" /> Create New Album
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto pt-4">
                {submitError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">{submitError}</div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  {/* Column 1: Basic Info + Artists + Genre */}
                  <div className="flex flex-col gap-3">

                    {/* Basic Information */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Basic Information</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Album Title <span className="text-red-400">*</span></label>
                          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter album title" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" required disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Release Date</label>
                            <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                          </div>
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">UPC</label>
                            <input type="text" name="upc" value={formData.upc} onChange={handleInputChange} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isSubmitting} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Artists */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Artists</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                        {/* Primary Artists Multiple Select */}
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Primary Artists <span className="text-red-400">*</span></label>
                          <div className="space-y-2">
                            {createPrimaryArtists.map((artist, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {artist.type === 'system' ? (
                                  <select
                                    value={artist.id}
                                    onChange={(e) => updateCreateArtistItem(index, 'system', e.target.value)}
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isSubmitting}
                                  >
                                    <option value="">Select system artist</option>
                                    {artistsList.map((a: any) => (
                                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={artist.name}
                                    onChange={(e) => updateCreateArtistItem(index, 'custom', e.target.value)}
                                    placeholder="Enter custom artist name"
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isSubmitting}
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCreatePrimaryArtists(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  disabled={createPrimaryArtists.length <= 1 || isSubmitting}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCreatePrimaryArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isSubmitting}
                            >
                              + Add System Artist
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCreatePrimaryArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isSubmitting}
                            >
                              + Add Custom Artist
                            </Button>
                          </div>
                        </div>

                        {/* Featuring Artists Multiple Select */}
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Featuring Artists</label>
                          <div className="space-y-2">
                            {createFeaturingArtists.map((artist, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {artist.type === 'system' ? (
                                  <select
                                    value={artist.id}
                                    onChange={(e) => updateCreateFeaturingArtistItem(index, 'system', e.target.value)}
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isSubmitting}
                                  >
                                    <option value="">Select system artist</option>
                                    {artistsList.map((a: any) => (
                                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={artist.name}
                                    onChange={(e) => updateCreateFeaturingArtistItem(index, 'custom', e.target.value)}
                                    placeholder="Enter custom artist name"
                                    className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                    required
                                    disabled={isSubmitting}
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCreateFeaturingArtists(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  disabled={isSubmitting}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCreateFeaturingArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isSubmitting}
                            >
                              + Add System Artist
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCreateFeaturingArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                              className="text-xs"
                              disabled={isSubmitting}
                            >
                              + Add Custom Artist
                            </Button>
                          </div>
                        </div>

                        {/* Display Artist */}
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Display Artist</label>
                          <input type="text" name="displayArtist" value={formData.displayArtist} onChange={handleInputChange} placeholder="Autofills if blank" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                        </div>
                      </div>
                    </div>

                    {/* Genre */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Classification</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Genre</label>
                            <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="e.g. Electronic" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                          </div>
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Subgenre</label>
                            <input type="text" name="subgenre" value={formData.subgenre} onChange={handleInputChange} placeholder="e.g. House" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Copyright + Platform IDs + Cover Art */}
                  <div className="flex flex-col gap-3">

                    {/* Copyright & Rights */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Copyright &amp; Rights</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Production Year (P)</label>
                            <input type="number" min="1900" max="2100" value={formData.pYear || ''} onChange={e => setFormData(p => ({ ...p, pYear: parseInt(e.target.value) }))} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                          </div>
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Year (C)</label>
                            <input type="number" min="1900" max="2100" value={formData.cYear || ''} onChange={e => setFormData(p => ({ ...p, cYear: parseInt(e.target.value) }))} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                          </div>
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Production Line (P)</label>
                          <input type="text" name="pLine" value={formData.pLine} onChange={handleInputChange} placeholder="e.g. © 2026 Label Name" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Line (C)</label>
                          <input type="text" name="cLine" value={formData.cLine} onChange={handleInputChange} placeholder="e.g. ℗ 2026 Label Name" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isSubmitting} />
                        </div>
                      </div>
                    </div>

                    {/* Platform IDs */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Platform IDs</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Spotify Album ID</label>
                            <input type="text" name="albumId" value={formData.albumId} onChange={handleInputChange} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isSubmitting} />
                          </div>
                          <div className="px-3 py-2.5">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">YouTube Music ID</label>
                            <input type="text" name="youtubeId" value={formData.youtubeId} onChange={handleInputChange} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isSubmitting} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cover Art */}
                    <div>
                      <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                        <span className="font-bold text-accent text-sm uppercase tracking-wider">Cover Art</span>
                      </div>
                      <div className="border border-t-0 border-border rounded-b-lg p-3">
                        {coverPreview ? (
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-accent/50 flex-shrink-0">
                              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              {formData.coverArt && !isUploading ? (
                                <p className="text-xs text-green-500 flex items-center gap-1 mb-2"><Check className="w-3 h-3" /> Uploaded successfully</p>
                              ) : isUploading ? (
                                <p className="text-xs text-muted-foreground mb-2">Uploading...</p>
                              ) : null}
                              <button type="button" onClick={removeCover} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1" disabled={isUploading}>
                                <X className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                              ${isDragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent/5'}`}
                          >
                            <ImageIcon className={`w-6 h-6 ${isDragOver ? 'text-accent' : 'text-muted-foreground'}`} />
                            <p className="text-sm text-center text-muted-foreground">
                              <span className="text-accent font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">JPG, PNG · Max 15MB</p>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }}
                          disabled={isSubmitting || isUploading} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-2 justify-end pt-4 mt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Check className="w-4 h-4 mr-2" />Create Album</>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          All ({albums.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = albums.filter((a: any) => a.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filterStatus === key
                ? 'bg-accent text-accent-foreground'
                : 'bg-card border border-border hover:border-accent/40'
                }`}
            >
              <config.icon className="w-4 h-4" />
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Albums Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-left text-sm font-bold">Album</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Artist</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Tracks</th>
                <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading albums...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : filteredAlbums.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {searchTerm || filterStatus ? 'No albums match your filter' : 'No albums found'}
                  </td>
                </tr>
              ) : (
                filteredAlbums.map((album: any, idx: number) => {
                  const config = statusConfig[album.status] || statusConfig.draft;
                  return (
                    <tr
                      key={album.id}
                      className={`border-b border-border hover:bg-accent/5 transition-colors ${idx === filteredAlbums.length - 1 ? 'border-0' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {album.coverArt ? (
                            <img src={album.coverArt} alt={album.title} className="w-10 h-10 rounded object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5 text-accent/40" />
                            </div>
                          )}
                          <p className="font-bold">{album.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{album.displayArtist || album.artistName}</td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownAlbumId(activeDropdownAlbumId === album.id ? null : album.id);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${config.bgColor} ${config.color} hover:opacity-80`}
                          >
                            <config.icon className="w-3.5 h-3.5 animate-pulse" />
                            {config.label}
                            <span className="text-[10px] opacity-65">▼</span>
                          </button>

                          {activeDropdownAlbumId === album.id && (
                            <div
                              className="absolute left-0 mt-2 w-64 rounded-xl shadow-2xl bg-card border border-border ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1.5 backdrop-blur-md bg-opacity-95"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground border-b border-border uppercase tracking-widest">
                                Tùy chọn Album
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownAlbumId(null);
                                  handleOpenEditDialog(album);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 font-semibold transition-colors duration-150"
                              >
                                <Edit className="w-4 h-4 text-accent" />
                                Update &amp; Edit Metadata
                              </button>

                              <div className="border-t border-border mt-1.5 pt-1.5">
                                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Cập nhật trạng thái nhanh
                                </div>
                                <div className="mt-1 space-y-0.5">
                                  {Object.entries(statusConfig).map(([key, c]) => {
                                    const disabled = isStatusDisabled(album.status, key);
                                    const StatusIcon = c.icon;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        disabled={disabled}
                                        onClick={async () => {
                                          setActiveDropdownAlbumId(null);
                                          handleStatusChange(album, key);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors duration-150
                                          ${disabled ? 'opacity-35 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'}
                                          ${album.status === key ? 'font-bold text-accent bg-accent/10' : 'text-foreground'}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <StatusIcon className={`w-4 h-4 ${c.color}`} />
                                          <span>{c.label}</span>
                                        </div>
                                        {album.status === key && <span className="text-xs text-accent">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{album.tracks?.length || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/admin/albums/${album.id}`}
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Delete Album</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete <strong>{album.title}</strong>? This action cannot be undone.
                              </p>
                              <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    try {
                                      const res = await apiClient.deleteAlbum(album.id) as any;
                                      if (res?.success) {
                                        refetch();
                                      } else {
                                        alert(res?.message || 'Failed to delete album');
                                      }
                                    } catch (error) {
                                      alert(error instanceof Error ? error.message : 'Failed to delete album');
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>


      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Update {statusUpdateData?.albumTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {statusUpdateData?.newStatus === 'submitted' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  UPC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={statusUpdateFields.upc || ''}
                  onChange={(e) => setStatusUpdateFields({ ...statusUpdateFields, upc: e.target.value })}
                  placeholder="Enter UPC"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}
            {statusUpdateData?.newStatus === 'approved' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Spotify Album ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={statusUpdateFields.albumId || ''}
                  onChange={(e) => setStatusUpdateFields({ ...statusUpdateFields, albumId: e.target.value })}
                  placeholder="Enter Spotify Album ID"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}
            {statusUpdateData?.newStatus === 'distributed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    YouTube Music ID
                  </label>
                  <input
                    type="text"
                    value={statusUpdateFields.youtubeId || ''}
                    onChange={(e) => setStatusUpdateFields({ ...statusUpdateFields, youtubeId: e.target.value })}
                    placeholder="Enter YouTube Music Album ID"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-600">
                  ℹ️ Thông tin YouTube Music sẽ được lưu để theo dõi phân phối trên nền tảng này.
                </div>
              </>
            )}
            {statusUpdateData?.newStatus === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Lý tự từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={statusUpdateFields.rejectionReason || ''}
                  onChange={(e) => setStatusUpdateFields({ ...statusUpdateFields, rejectionReason: e.target.value })}
                  placeholder="Nhập lý do từ chối (bắt buộc)..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  if (statusUpdateData) {
                    submitStatusUpdate(statusUpdateData.albumId, statusUpdateData.newStatus, statusUpdateFields);
                  }
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card w-[95vw] max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col !p-5">
          <DialogHeader className="flex-shrink-0 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-accent" /> Edit Album - {editAlbumData?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pt-4">
              {editError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg text-sm">{editError}</div>
              )}

              <div className="grid grid-cols-2 gap-8">
                {/* Column 1: Basic Info + Artists + Genre */}
                <div className="flex flex-col gap-3">

                  {/* Basic Information */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Basic Information</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Album Title <span className="text-red-400">*</span></label>
                        <input type="text" name="title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Enter album title" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" required disabled={isEditSubmitting} />
                      </div>
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Release Date</label>
                          <input type="date" name="releaseDate" value={editForm.releaseDate || ''} onChange={e => setEditForm({ ...editForm, releaseDate: e.target.value })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">UPC</label>
                          <input type="text" name="upc" value={editForm.upc || ''} onChange={e => setEditForm({ ...editForm, upc: e.target.value })} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isEditSubmitting} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Artists */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Artists</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      {/* Primary Artists Multiple Select */}
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-2">Primary Artists <span className="text-red-400">*</span></label>
                        <div className="space-y-2">
                          {editPrimaryArtists.map((artist, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {artist.type === 'system' ? (
                                <select
                                  value={artist.id}
                                  onChange={(e) => updateEditArtistItem(index, 'system', e.target.value)}
                                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                  required
                                  disabled={isEditSubmitting}
                                >
                                  <option value="">Select system artist</option>
                                  {artistsList.map((a: any) => (
                                    <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={artist.name}
                                  onChange={(e) => updateEditArtistItem(index, 'custom', e.target.value)}
                                  placeholder="Enter custom artist name"
                                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                  required
                                  disabled={isEditSubmitting}
                                />
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditPrimaryArtists(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={editPrimaryArtists.length <= 1 || isEditSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditPrimaryArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                            className="text-xs"
                            disabled={isEditSubmitting}
                          >
                            + Add System Artist
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditPrimaryArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                            className="text-xs"
                            disabled={isEditSubmitting}
                          >
                            + Add Custom Artist
                          </Button>
                        </div>
                      </div>

                      {/* Featuring Artists Multiple Select */}
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-2">Featuring Artists</label>
                        <div className="space-y-2">
                          {editFeaturingArtists.map((artist, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {artist.type === 'system' ? (
                                <select
                                  value={artist.id}
                                  onChange={(e) => updateEditFeaturingArtistItem(index, 'system', e.target.value)}
                                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                  required
                                  disabled={isEditSubmitting}
                                >
                                  <option value="">Select system artist</option>
                                  {artistsList.map((a: any) => (
                                    <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={artist.name}
                                  onChange={(e) => updateEditFeaturingArtistItem(index, 'custom', e.target.value)}
                                  placeholder="Enter custom artist name"
                                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                                  required
                                  disabled={isEditSubmitting}
                                />
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditFeaturingArtists(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={isEditSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditFeaturingArtists(p => [...p, { type: 'system', id: '', name: '' }])}
                            className="text-xs"
                            disabled={isEditSubmitting}
                          >
                            + Add System Artist
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditFeaturingArtists(p => [...p, { type: 'custom', id: '', name: '' }])}
                            className="text-xs"
                            disabled={isEditSubmitting}
                          >
                            + Add Custom Artist
                          </Button>
                        </div>
                      </div>

                      {/* Display Artist */}
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Display Artist</label>
                        <input type="text" name="displayArtist" value={editForm.displayArtist || ''} onChange={e => setEditForm({ ...editForm, displayArtist: e.target.value })} placeholder="Autofills if blank" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                      </div>
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Classification</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Genre</label>
                          <input type="text" name="genre" value={editForm.genre || ''} onChange={e => setEditForm({ ...editForm, genre: e.target.value })} placeholder="e.g. Electronic" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Subgenre</label>
                          <input type="text" name="subgenre" value={editForm.subgenre || ''} onChange={e => setEditForm({ ...editForm, subgenre: e.target.value })} placeholder="e.g. House" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Copyright + Platform IDs + Cover Art */}
                <div className="flex flex-col gap-3">

                  {/* Copyright & Rights */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Copyright &amp; Rights</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Production Year (P)</label>
                          <input type="number" min="1900" max="2100" value={editForm.pYear || ''} onChange={e => setEditForm({ ...editForm, pYear: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Year (C)</label>
                          <input type="number" min="1900" max="2100" value={editForm.cYear || ''} onChange={e => setEditForm({ ...editForm, cYear: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                        </div>
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Production Line (P)</label>
                        <input type="text" name="pLine" value={editForm.pLine || ''} onChange={e => setEditForm({ ...editForm, pLine: e.target.value })} placeholder="e.g. © 2026 Label Name" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                      </div>
                      <div className="px-3 py-2.5">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Copyright Line (C)</label>
                        <input type="text" name="cLine" value={editForm.cLine || ''} onChange={e => setEditForm({ ...editForm, cLine: e.target.value })} placeholder="e.g. ℗ 2026 Label Name" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none" disabled={isEditSubmitting} />
                      </div>
                    </div>
                  </div>

                  {/* Platform IDs */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Platform IDs</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border">
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Spotify Album ID</label>
                          <input type="text" name="albumId" value={editForm.albumId || ''} onChange={e => setEditForm({ ...editForm, albumId: e.target.value })} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isEditSubmitting} />
                        </div>
                        <div className="px-3 py-2.5">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">YouTube Music ID</label>
                          <input type="text" name="youtubeId" value={editForm.youtubeId || ''} onChange={e => setEditForm({ ...editForm, youtubeId: e.target.value })} placeholder="Optional" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:outline-none font-mono" disabled={isEditSubmitting} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Art */}
                  <div>
                    <div className="bg-accent/5 border border-border rounded-t-lg px-4 py-2.5">
                      <span className="font-bold text-accent text-sm uppercase tracking-wider">Cover Art</span>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-lg p-3">
                      {editCoverPreview || editForm.coverArt ? (
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-accent/50 flex-shrink-0">
                            <img src={editCoverPreview || editForm.coverArt} alt="Cover preview" className="w-full h-full object-cover" />
                            {isEditUploading && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            {editForm.coverArt && !isEditUploading ? (
                              <p className="text-xs text-green-500 flex items-center gap-1 mb-2"><Check className="w-3 h-3" /> Uploaded successfully</p>
                            ) : isEditUploading ? (
                              <p className="text-xs text-muted-foreground mb-2">Uploading...</p>
                            ) : null}
                            <button type="button" onClick={removeEditCover} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1" disabled={isEditUploading}>
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDrop={handleEditDrop}
                          onDragOver={(e) => { e.preventDefault(); }}
                          onClick={() => editFileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
                        >
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <p className="text-sm text-center text-muted-foreground">
                            <span className="text-accent font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">JPG, PNG · Max 15MB</p>
                        </div>
                      )}
                      <input ref={editFileInputRef} type="file" accept="image/jpeg,image/png" className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleEditFileSelect(file); }}
                        disabled={isEditSubmitting || isEditUploading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-2 justify-end pt-4 mt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isEditSubmitting}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isEditSubmitting || isEditUploading}>
                {isEditSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : <><Check className="w-4 h-4 mr-2" />Update Album</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
