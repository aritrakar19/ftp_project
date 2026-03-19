import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [event, setEvent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    // Assuming backend will be updated to handle multiple 'images'
    files.forEach(f => formData.append('images', f));
    formData.append('title', title);
    formData.append('tags', tags);
    formData.append('event', event);

    try {
      await api.post('/ftp-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploading(false);
      resetForm();
      onUploadSuccess();
      onClose();
    } catch (err) {
      // Provide fallback using loop if backend only supports single uploads for now
      try {
        const uploadPromises = files.map(f => {
          const singleData = new FormData();
          singleData.append('image', f);
          singleData.append('title', title);
          singleData.append('tags', tags);
          singleData.append('event', event);
          return api.post('/images', singleData, { headers: { 'Content-Type': 'multipart/form-data' } });
        });
        await Promise.all(uploadPromises);
        
        setUploading(false);
        resetForm();
        onUploadSuccess();
        onClose();
      } catch (fallbackErr) {
        setError(fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to upload images');
        setUploading(false);
      }
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setTags('');
    setEvent('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Upload New Photo</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                
                {files.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-gray-900 truncate max-w-full">{files.length} file(s) selected</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {files.map(f => f.name).join(', ').substring(0, 50)}...
                    </p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                      className="mt-3 text-sm text-red-500 hover:text-red-700"
                    >
                      Clear selection
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center flex flex-col items-center text-gray-500">
                    <UploadCloud className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-sm">Drag & drop images here, or click to select multiple</p>
                    <p className="text-xs mt-2 text-gray-400">Supports JPG, PNG, WEBP (Select multiple)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="Give your photo a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="E.g., Summer Wedding 2026"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Comma separated)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="nature, portrait, outdoor..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={uploading}
            className={`px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm ${
              uploading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
