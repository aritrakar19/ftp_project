import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image as ImageIcon, FolderPlus, Folder } from 'lucide-react';
import api from '../api/axios';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [event, setEvent] = useState('');
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState('');
  const [newGalleryName, setNewGalleryName] = useState('');
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Fetch galleries whenever modal opens
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
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    multiple: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }
    if (isCreatingGallery && !newGalleryName.trim()) {
      setError('Please enter a name for the new gallery');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Resolve gallery ID
      let finalGalleryId = selectedGallery;
      if (isCreatingGallery && newGalleryName.trim()) {
        const galleryRes = await api.post('/galleries', { title: newGalleryName.trim() });
        finalGalleryId = galleryRes.data._id;
      }

      // Step 2: Upload images sequentially so we can track progress
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const singleData = new FormData();
        singleData.append('image', f);
        singleData.append('title', f.name);
        singleData.append('tags', tags);
        singleData.append('event', event);
        if (finalGalleryId) singleData.append('galleryId', finalGalleryId);
        await api.post('/images', singleData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setUploading(false);
      resetForm();
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload images');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTags('');
    setEvent('');
    setSelectedGallery('');
    setNewGalleryName('');
    setIsCreatingGallery(false);
    setError('');
    setProgress(0);
  };

  const handleClose = () => {
    if (uploading) return;
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Upload Photos</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select images and assign to a gallery</p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Dropzone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-gray-400 font-normal">(select multiple)</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {files.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="font-semibold text-gray-900">{files.length} file(s) ready</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      {files.map(f => f.name).join(', ')}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                      className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      ✕ Clear all
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <UploadCloud className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-sm font-medium">Drop images here, or click to browse</p>
                    <p className="text-xs mt-1.5 text-gray-400">JPG, PNG, WEBP, GIF — multiple allowed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-indigo-500" /> Gallery
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white text-sm"
                value={isCreatingGallery ? '__new__' : selectedGallery}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreatingGallery(true);
                    setSelectedGallery('');
                  } else {
                    setIsCreatingGallery(false);
                    setSelectedGallery(e.target.value);
                  }
                }}
              >
                <option value="">— No Gallery —</option>
                {galleries.map(g => (
                  <option key={g._id} value={g._id}>{g.title}</option>
                ))}
                <option value="__new__">＋ Create New Gallery…</option>
              </select>

              {isCreatingGallery && (
                <div className="mt-2 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-indigo-50 text-sm"
                    placeholder="New gallery name…"
                    value={newGalleryName}
                    onChange={(e) => setNewGalleryName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Event */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event / Occasion</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                placeholder="E.g., Annual Family Reunion 2026"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                placeholder="nature, portrait, outdoor…"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="px-6 pb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={uploading || files.length === 0}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading {progress}%
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload {files.length > 0 ? `${files.length} Photo${files.length > 1 ? 's' : ''}` : 'Photos'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
