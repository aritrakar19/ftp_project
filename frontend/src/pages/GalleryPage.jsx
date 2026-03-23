import { useState, useCallback, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import api from '../api/axios';

const GalleryPage = () => {
  const [images, setImages]           = useState([]);
  const [keyword, setKeyword]         = useState('');
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchImages = useCallback(async (pageNum = 1, searchQuery = '') => {
    try {
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const { data } = await api.get(`/images?pageNumber=${pageNum}&keyword=${searchQuery}`);
      if (pageNum === 1) setImages(data.images);
      else setImages(prev => [...prev, ...data.images]);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchImages(1, keyword); }, 500);
    return () => clearTimeout(t);
  }, [keyword, fetchImages]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
      fetchImages(page + 1, keyword);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Hero header ── */}
      <div
        className="relative glass rounded-2xl p-8 overflow-hidden"
        style={{ boxShadow: '0 8px 32px rgb(139 92 246 / 0.15)' }}
      >
        {/* background glow */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgb(139 92 246/0.2),transparent)' }}
          aria-hidden
        />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                Collections
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Discover Images
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgb(148 150 180)' }}>
              Explore carefully curated high‑quality photos
            </p>
          </div>

          {/* Search */}
          <div className="w-full md:w-80 relative flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgb(148 150 180)' }} />
            <input
              id="gallery-search"
              type="text"
              className="field pl-10"
              placeholder="Search by tags, events…"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spin-ring" />
        </div>
      ) : (
        <>
          <ImageGallery images={images} />

          {page < totalPages && (
            <div className="flex justify-center pt-6 pb-4">
              <button
                id="load-more-btn"
                onClick={loadMore}
                disabled={fetchingMore}
                className="btn-ghost px-8 py-3 disabled:opacity-50"
              >
                {fetchingMore ? (
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
  );
};

export default GalleryPage;
