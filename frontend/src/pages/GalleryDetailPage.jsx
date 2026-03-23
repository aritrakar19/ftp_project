import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Images as ImagesIcon, Search } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from 'yet-another-react-lightbox/plugins/download';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Skeleton ──────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="aspect-square rounded-xl animate-pulse" style={{ background: 'rgb(255 255 255 / 0.06)' }} />
);

/* ─── GalleryDetailPage ─────────────────────────────────────────── */
const GalleryDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gallery, setGallery]       = useState(null);
  const [images, setImages]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState(null);

  const fetchImages = async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      // Fetch gallery meta
      if (replace) {
        const galleriesRes = await api.get('/galleries');
        const found = galleriesRes.data.find(g => g._id === id);
        setGallery(found || null);
      }

      const { data } = await api.get(`/images?galleryId=${id}&pageNumber=${pageNum}&pageSize=20`);

      if (replace) setImages(data.images || []);
      else setImages(prev => [...prev, ...(data.images || [])]);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Could not load gallery.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchImages(1, true);
  }, [id]);

  const loadMore = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchImages(next, false);
    }
  };

  const filtered = images.filter(img =>
    !search || img.title?.toLowerCase().includes(search.toLowerCase()) ||
    img.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const slides = filtered.map(img => ({
    src: `http://localhost:5001${img.url}`,
    title: img.title || 'Untitled',
    description: img.tags?.join(', ') || '',
    imageId: img._id,
  }));

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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-6 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
          <div className="h-4 w-40 rounded-full animate-pulse" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
        </div>
        <div className="h-7 w-56 rounded-full animate-pulse" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {Array.from({ length: 18 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  /* ── Error / Not found ── */
  if (error || !gallery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ImagesIcon className="w-12 h-12 mb-4" style={{ color: 'rgb(139 92 246 / 0.4)' }} />
        <p className="font-semibold text-white mb-2">{error || 'Gallery not found'}</p>
        <Link to="/galleries" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Galleries
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 py-2">

        {/* ── Breadcrumb ── */}
        <Link
          to="/galleries"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{ color: 'rgb(148 150 180)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgb(148 150 180)'}
        >
          <ArrowLeft className="w-4 h-4" />
          All Galleries
        </Link>

        {/* ── Hero meta ── */}
        <div
          className="relative glass rounded-2xl p-6 overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgb(139 92 246 / 0.12)' }}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgb(139 92 246 / 0.2), transparent)' }} aria-hidden />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {gallery.category && gallery.category !== 'Other' && (
                  <span className="tag">{gallery.category}</span>
                )}
                {gallery.isPrivate && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgb(239 68 68 / 0.15)', color: '#f87171', border: '1px solid rgb(239 68 68 / 0.2)' }}>
                    <Lock className="w-2.5 h-2.5" /> Private
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {gallery.title}
              </h1>
              {gallery.description && (
                <p className="mt-1 text-sm" style={{ color: 'rgb(148 150 180)' }}>{gallery.description}</p>
              )}
              <p className="mt-2 text-sm font-medium" style={{ color: 'rgb(148 150 180)' }}>
                {gallery.imageCount ?? images.length} Images
              </p>
            </div>

            {/* Search within gallery */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'rgb(148 150 180)' }} />
              <input
                id="gallery-detail-search"
                type="text"
                className="field pl-10 text-sm"
                placeholder="Search images…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Image grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ border: '2px dashed rgb(255 255 255 / 0.07)' }}>
            <ImagesIcon className="w-10 h-10 mb-3" style={{ color: 'rgb(139 92 246 / 0.4)' }} />
            <p className="font-semibold text-white mb-1">No images found</p>
            <p className="text-sm" style={{ color: 'rgb(148 150 180)' }}>
              {search ? 'Try a different keyword.' : 'Upload images to this gallery.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
              {filtered.map((img, i) => (
                <div
                  key={img._id}
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                  style={{ background: 'rgb(255 255 255 / 0.04)' }}
                  onClick={() => setLightboxIdx(i)}
                >
                  <LazyLoadImage
                    alt={img.title}
                    src={`http://localhost:5001${img.thumbnailUrl || img.url}`}
                    effect="opacity"
                    wrapperClassName="w-full h-full block"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2"
                    style={{ background: 'linear-gradient(to top, rgb(0 0 0/0.75), transparent)' }}
                  >
                    <p className="text-white text-[9px] font-medium leading-tight truncate w-full">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div className="flex justify-center pt-4">
                <button
                  id="gallery-detail-load-more"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-ghost px-8 py-3 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading…
                    </span>
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxIdx >= 0}
        index={lightboxIdx}
        close={() => setLightboxIdx(-1)}
        slides={slides}
        plugins={[Zoom, Download]}
        download={{ download: ({ slide }) => handleDownload(slide.src, slide.imageId) }}
        styles={{ container: { background: 'rgb(10 10 20 / 0.96)', backdropFilter: 'blur(20px)' } }}
      />
    </>
  );
};

export default GalleryDetailPage;
