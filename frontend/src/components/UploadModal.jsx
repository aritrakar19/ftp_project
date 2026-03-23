import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, X, Image as ImageIcon, FolderPlus,
  Folder, Zap, CheckCircle, AlertCircle,
} from 'lucide-react';
import api from '../api/axios';

/* ── Tiny tab button ─────────────────────────────────────── */
const Tab = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200"
    style={{
      background: active ? 'rgb(139 92 246 / 0.18)' : 'transparent',
      color: active ? '#c4b5fd' : 'rgb(100 110 140)',
      border: active ? '1px solid rgb(139 92 246 / 0.3)' : '1px solid transparent',
    }}
  >
    {children}
  </button>
);

/* ── File row ────────────────────────────────────────────── */
const FileRow = ({ file, status }) => {
  const icon =
    status === 'done'  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> :
    status === 'error' ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> :
    status === 'uploading' ? (
      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : <div className="w-3.5 h-3.5 rounded-full" style={{ border: '1.5px solid rgb(100 110 140)' }} />;

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="shrink-0" style={{ color: 'rgb(148 150 180)' }}>{icon}</div>
      <span className="text-xs text-white truncate flex-1">{file.name}</span>
      <span className="text-[10px] shrink-0" style={{ color: 'rgb(100 110 140)' }}>
        {(file.size / 1024).toFixed(0)} KB
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [tab, setTab]                         = useState('standard'); // 'standard' | 'bulk'
  const [files, setFiles]                     = useState([]);
  const [tags, setTags]                       = useState('');
  const [event, setEvent]                     = useState('');
  const [galleries, setGalleries]             = useState([]);
  const [selectedGallery, setSelectedGallery] = useState('');
  const [newGalleryName, setNewGalleryName]   = useState('');
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [progress, setProgress]               = useState(0);
  const [fileStatuses, setFileStatuses]       = useState({}); // filename → 'pending'|'uploading'|'done'|'error'
  const [error, setError]                     = useState('');
  const [successMsg, setSuccessMsg]           = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/galleries')
        .then(res => setGalleries(res.data))
        .catch(console.error);
    }
  }, [isOpen]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
      const newStatuses = {};
      acceptedFiles.forEach(f => { newStatuses[f.name + f.size] = 'pending'; });
      setFileStatuses(prev => ({ ...prev, ...newStatuses }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    multiple: true,
  });

  /* ── Standard: upload one-by-one (shows per-file progress) ── */
  const handleStandardUpload = async (finalGalleryId) => {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const key = f.name + f.size;
      setFileStatuses(prev => ({ ...prev, [key]: 'uploading' }));
      try {
        const fd = new FormData();
        fd.append('image', f);
        fd.append('title', f.name);
        fd.append('tags', tags);
        fd.append('event', event);
        if (finalGalleryId) fd.append('galleryId', finalGalleryId);
        await api.post('/images', fd);
        setFileStatuses(prev => ({ ...prev, [key]: 'done' }));
      } catch (err) {
        setFileStatuses(prev => ({ ...prev, [key]: 'error' }));
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
  };

  /* ── Bulk FTP: single multipart request with all files ─────── */
  const handleBulkFtpUpload = async (finalGalleryId) => {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    fd.append('event', event || 'FTP Bulk Upload');
    fd.append('tags', tags);
    if (finalGalleryId) fd.append('galleryId', finalGalleryId);

    // Mark all as uploading
    const uploading = {};
    files.forEach(f => { uploading[f.name + f.size] = 'uploading'; });
    setFileStatuses(uploading);

    await api.post('/ftp-images/upload', fd, {
      onUploadProgress: e => {
        const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
        setProgress(pct);
      },
    });

    // Mark all done
    const done = {};
    files.forEach(f => { done[f.name + f.size] = 'done'; });
    setFileStatuses(done);
    setProgress(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { setError('Please select at least one image'); return; }
    if (isCreatingGallery && !newGalleryName.trim()) { setError('Please enter a gallery name'); return; }

    setUploading(true);
    setError('');
    setSuccessMsg('');
    setProgress(0);

    try {
      let finalGalleryId = selectedGallery;
      if (isCreatingGallery && newGalleryName.trim()) {
        const galleryRes = await api.post('/galleries', { title: newGalleryName.trim() });
        finalGalleryId = galleryRes.data._id;
        setGalleries(prev => [...prev, galleryRes.data]);
      }

      if (tab === 'bulk') {
        await handleBulkFtpUpload(finalGalleryId);
        setSuccessMsg(`${files.length} image${files.length > 1 ? 's' : ''} uploaded via FTP bulk upload!`);
      } else {
        await handleStandardUpload(finalGalleryId);
        const doneCount = Object.values(fileStatuses).filter(s => s === 'done').length;
        setSuccessMsg(`Upload complete!`);
      }

      onUploadSuccess();
      setTimeout(() => { resetForm(); onClose(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]); setTags(''); setEvent('');
    setSelectedGallery(''); setNewGalleryName('');
    setIsCreatingGallery(false); setError('');
    setProgress(0); setFileStatuses({}); setSuccessMsg('');
  };

  const handleClose = () => { if (uploading) return; resetForm(); onClose(); };

  if (!isOpen) return null;

  const hasFiles = files.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgb(0 0 0 / 0.75)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="glass-strong rounded-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          maxHeight: '92vh',
          boxShadow: '0 30px 80px rgb(0 0 0 / 0.6)',
          border: '1px solid rgb(255 255 255 / 0.1)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex justify-between items-center px-6 py-5 border-b"
          style={{ borderColor: 'rgb(255 255 255 / 0.07)' }}
        >
          <div>
            <h2 className="text-base font-bold text-white">Upload Photos</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(148 150 180)' }}>
              Select images and assign to a gallery
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ color: 'rgb(148 150 180)', border: '1px solid rgb(255 255 255 / 0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgb(255 255 255 / 0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgb(148 150 180)'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Upload mode tabs */}
          

          {tab === 'bulk' && (
            <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgb(139 92 246 / 0.08)', border: '1px solid rgb(139 92 246 / 0.2)', color: '#c4b5fd' }}>
              <strong>FTP Bulk Upload</strong> — sends all selected images in a single request. Best for uploading many photos at once (up to 50 files per batch).
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.25)', color: '#f87171' }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgb(16 185 129 / 0.1)', border: '1px solid rgb(16 185 129 / 0.25)', color: '#34d399' }}
            >
              <CheckCircle className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">

            {/* ── Dropzone ── */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgb(148 150 180)' }}>
                Images <span className="normal-case font-normal">(select multiple)</span>
              </label>
              <div
                {...getRootProps()}
                className="rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
                style={{
                  border: `2px dashed ${isDragActive ? '#8b5cf6' : 'rgb(255 255 255 / 0.12)'}`,
                  background: isDragActive ? 'rgb(139 92 246 / 0.08)' : 'rgb(255 255 255 / 0.02)',
                }}
                onMouseEnter={e => { if (!isDragActive) e.currentTarget.style.borderColor = 'rgb(139 92 246 / 0.5)'; }}
                onMouseLeave={e => { if (!isDragActive) e.currentTarget.style.borderColor = 'rgb(255 255 255 / 0.12)'; }}
              >
                <input {...getInputProps()} />
                {hasFiles ? (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 0 20px rgb(139 92 246 / 0.4)' }}
                    >
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-white">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                    <p className="text-xs mt-1" style={{ color: 'rgb(148 150 180)' }}>
                      Drop more to add, or{' '}
                      <button type="button" onClick={e => { e.stopPropagation(); resetForm(); }}
                        className="underline" style={{ color: '#f87171' }}>clear all</button>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center" style={{ color: 'rgb(100 100 130)' }}>
                    <UploadCloud className="w-10 h-10 mb-3" style={{ color: 'rgb(139 92 246 / 0.4)' }} />
                    <p className="text-sm font-medium text-white">Drop images here, or click to browse</p>
                    <p className="text-xs mt-1.5">JPG · PNG · WEBP · GIF — multiple allowed</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── File list (bulk mode) ── */}
            {tab === 'bulk' && hasFiles && (
              <div
                className="rounded-xl divide-y overflow-y-auto"
                style={{
                  maxHeight: '140px',
                  background: 'rgb(255 255 255 / 0.03)',
                  border: '1px solid rgb(255 255 255 / 0.08)',
                  divideColor: 'rgb(255 255 255 / 0.05)',
                }}
              >
                {files.map(f => (
                  <div key={f.name + f.size} className="px-3">
                    <FileRow file={f} status={fileStatuses[f.name + f.size] || 'pending'} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Gallery Picker ── */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgb(148 150 180)' }}>
                <Folder className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
                Gallery
              </label>
              <select
                className="field"
                value={isCreatingGallery ? '__new__' : selectedGallery}
                onChange={e => {
                  if (e.target.value === '__new__') { setIsCreatingGallery(true); setSelectedGallery(''); }
                  else { setIsCreatingGallery(false); setSelectedGallery(e.target.value); }
                }}
                style={{ appearance: 'none' }}
              >
                <option value="" style={{ background: '#16162a' }}>— No Gallery —</option>
                {galleries.map(g => (
                  <option key={g._id} value={g._id} style={{ background: '#16162a' }}>{g.title}</option>
                ))}
                <option value="__new__" style={{ background: '#16162a' }}>＋ Create New Gallery…</option>
              </select>

              {isCreatingGallery && (
                <div className="mt-2 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                  <input
                    type="text"
                    className="field flex-1 py-2"
                    placeholder="New gallery name…"
                    value={newGalleryName}
                    onChange={e => setNewGalleryName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* ── Event ── */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgb(148 150 180)' }}>Event / Occasion</label>
              <input
                type="text"
                className="field"
                placeholder="E.g., IPL Final 2026"
                value={event}
                onChange={e => setEvent(e.target.value)}
              />
            </div>

            {/* ── Tags ── */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgb(148 150 180)' }}>
                Tags <span className="normal-case font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                className="field"
                placeholder="cricket, stadium, final…"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* ── Progress bar ── */}
        {uploading && (
          <div className="px-6 pb-3">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgb(148 150 180)' }}>
              <span>{tab === 'bulk' ? 'Uploading batch…' : `Uploading file ${Math.ceil((progress / 100) * files.length)} of ${files.length}…`}</span>
              <span style={{ color: '#a78bfa' }}>{progress}%</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: 'rgb(255 255 255 / 0.08)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg,#8b5cf6,#6366f1)',
                  boxShadow: '0 0 8px rgb(139 92 246 / 0.6)',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 flex justify-end gap-3 border-t"
          style={{ borderColor: 'rgb(255 255 255 / 0.07)', background: 'rgb(255 255 255 / 0.02)' }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="btn-ghost disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={uploading || !hasFiles}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress}%
              </>
            ) : tab === 'bulk' ? (
              <>
                <Zap className="w-4 h-4" />
                Bulk Upload {hasFiles ? `${files.length} Photo${files.length > 1 ? 's' : ''}` : ''}
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload {hasFiles ? `${files.length} Photo${files.length > 1 ? 's' : ''}` : 'Photos'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
