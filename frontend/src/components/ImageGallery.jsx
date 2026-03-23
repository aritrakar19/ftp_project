import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from 'yet-another-react-lightbox/plugins/download';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ImageGallery = ({ images }) => {
  const [index, setIndex] = useState(-1);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDownload = async (url, id) => {
    if (!user) {
      alert("Please log in to download images.");
      navigate('/login');
      return;
    }
    try {
      await api.post(`/images/${id}/download`);
      // Force download via Blob to avoid cross-origin new tab opening
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Access Denied: You do not have permission to download this image. Please request access from an admin.");
      } else {
        alert("Download failed. Please try again later.");
      }
    }
  };

  if (!images || images.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 rounded-2xl"
        style={{ border: '2px dashed rgb(255 255 255 / 0.08)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgb(139 92 246 / 0.1)' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'rgb(139 92 246 / 0.5)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-semibold text-white mb-1">No images found</p>
        <p className="text-sm" style={{ color: 'rgb(148 150 180)' }}>
          Upload some photos to get started
        </p>
      </div>
    );
  }

  const slides = images.map(img => ({
    src: `http://localhost:5000${img.url}`,
    title: img.title || 'Untitled',
    description: img.tags?.join(', ') || '',
    imageId: img._id,
  }));

  return (
    <>
      <div className="masonry-grid">
        {images.map((img, i) => (
          <div
            key={img._id}
            className="masonry-item relative group cursor-pointer overflow-hidden rounded-xl hover-trigger"
            style={{
              background: 'rgb(255 255 255 / 0.04)',
              boxShadow: '0 4px 20px rgb(0 0 0 / 0.3)',
              transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            }}
            onClick={() => setIndex(i)}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgb(139 92 246 / 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgb(0 0 0 / 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LazyLoadImage
              alt={img.title}
              src={`http://localhost:5000${img.thumbnailUrl}`}
              effect="opacity"
              wrapperClassName="w-full h-full block"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 hover-target flex flex-col justify-end p-3"
              style={{ background: 'linear-gradient(to top,rgb(0 0 0/0.8) 0%,transparent 60%)' }}
            >
              <h3 className="text-white text-sm font-semibold truncate">{img.title || 'Untitled'}</h3>
              {img.tags && img.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {img.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom, Download]}
        download={{
          download: ({ slide }) => handleDownload(slide.src, slide.imageId)
        }}
        styles={{
          container: { background: 'rgb(10 10 20 / 0.95)', backdropFilter: 'blur(20px)' },
        }}
      />
    </>
  );
};

export default ImageGallery;
