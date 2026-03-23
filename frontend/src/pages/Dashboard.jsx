import { useState, useEffect } from 'react';
import {
  Plus, Image as ImageIcon, FolderOpen, ArrowUpRight,
  Layers, Search, TrendingUp,
} from 'lucide-react';
import UploadModal from '../components/UploadModal';
import api from '../api/axios';

/* ─── Stat Card ─────────────────────────────────────────────── */
const CARD_ACCENTS = {
  violet: { from: '#8b5cf6', to: '#6366f1', glow: 'rgb(139 92 246 / 0.3)' },
  emerald: { from: '#10b981', to: '#059669', glow: 'rgb(16 185 129 / 0.3)' },
  sky:    { from: '#38bdf8', to: '#0ea5e9', glow: 'rgb(56 189 248 / 0.3)' },
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'violet' }) => {
  const ac = CARD_ACCENTS[color] || CARD_ACCENTS.violet;
  return (
    <div
      className="stat-card glass rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: `0 8px 32px ${ac.glow}` }}
    >
      <div className="flex justify-between items-start">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg,${ac.from},${ac.to})`, boxShadow: `0 0 16px ${ac.glow}` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgb(16 185 129 / 0.15)', color: '#34d399' }}
          >
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgb(148 150 180)' }}>
          {title}
        </p>
        <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

/* ─── Gallery Section ────────────────────────────────────────── */
const GallerySection = ({ gallery, images }) => (
  <div className="glass rounded-2xl overflow-hidden">
    {/* Header */}
    <div
      className="flex items-center gap-3 px-5 py-4 border-b"
      style={{ borderColor: 'rgb(255 255 255 / 0.07)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
      >
        <FolderOpen className="w-4 h-4 text-white" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{gallery?.title ?? 'Uncategorised'}</h2>
        <p className="text-xs" style={{ color: 'rgb(148 150 180)' }}>
          {images.length} photo{images.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>

    {/* Grid */}
    {images.length === 0 ? (
      <div className="flex items-center justify-center h-24 text-sm" style={{ color: 'rgb(100 100 130)' }}>
        No images yet
      </div>
    ) : (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0.5 p-0.5">
        {images.map(img => (
          <div
            key={img._id}
            className="relative aspect-square overflow-hidden group bg-white/5 rounded-sm"
          >
            <img
              src={`http://localhost:5000${img.thumbnailUrl || img.url}`}
              alt={img.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-1.5"
              style={{ background: 'linear-gradient(to top,rgb(0 0 0/0.7),transparent)' }}
            >
              <p className="text-white text-[9px] font-medium leading-tight truncate w-full">{img.title}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [isUploadOpen, setIsUploadOpen]       = useState(false);
  const [totalImages, setTotalImages]         = useState(0);
  const [totalGalleries, setTotalGalleries]   = useState(0);
  const [gallerySections, setGallerySections] = useState([]);
  const [searchQuery, setSearchQuery]         = useState('');
  const [loading, setLoading]                 = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [galleriesRes, imagesRes] = await Promise.all([
        api.get('/galleries'),
        api.get('/images?pageSize=200'),
      ]);

      const galleries = galleriesRes.data || [];
      const images    = imagesRes.data.images || [];
      setTotalImages(imagesRes.data.count || images.length);
      setTotalGalleries(galleries.length);

      const galleryMap = new Map();
      galleries.forEach(g => galleryMap.set(g._id, { gallery: g, images: [] }));
      galleryMap.set('__none__', { gallery: null, images: [] });

      images.forEach(img => {
        const gid = img.galleryId?._id || img.galleryId || '__none__';
        if (galleryMap.has(gid)) galleryMap.get(gid).images.push(img);
        else galleryMap.get('__none__').images.push(img);
      });

      const sections = [...galleryMap.values()].filter(
        s => s.gallery !== null || s.images.length > 0
      );
      setGallerySections(sections);
    } catch (err) {
      console.error(
        'Dashboard fetch failed',
        err.response?.status,
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchData(); }, []);

  const filteredSections = gallerySections
    .map(section => ({
      ...section,
      images: searchQuery
        ? section.images.filter(img =>
            img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            img.event?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : section.images,
    }))
    .filter(s => !searchQuery || s.images.length > 0);

  const recentTitle = gallerySections.find(s => s.images.length > 0)?.images[0]?.title;

  return (
    <>
      <div className="space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgb(148 150 180)' }}>
              All your images, organised by gallery
            </p>
          </div>
          <button
            id="open-upload-modal"
            onClick={() => setIsUploadOpen(true)}
            className="btn-primary px-6 py-3"
          >
            <Plus className="w-4 h-4" />
            Upload Photos
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Total Photos"    value={loading ? '—' : totalImages}    icon={ImageIcon} color="violet" />
          <StatCard title="Total Galleries" value={loading ? '—' : totalGalleries} icon={Layers}    color="emerald" />
          <StatCard
            title="Recent Upload"
            value={loading ? '—' : (recentTitle ? recentTitle.substring(0, 16) + '…' : '—')}
            icon={ArrowUpRight}
            color="sky"
          />
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgb(148 150 180)' }} />
          <input
            id="dashboard-search"
            type="text"
            className="field pl-10"
            placeholder="Search by filename, tag, or event…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ── Gallery Sections ── */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="spin-ring" />
          </div>
        ) : filteredSections.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ border: '2px dashed rgb(255 255 255 / 0.08)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgb(139 92 246 / 0.1)' }}
            >
              <ImageIcon className="w-8 h-8" style={{ color: 'rgb(139 92 246 / 0.5)' }} />
            </div>
            <p className="font-semibold text-white mb-1">No photos yet</p>
            <p className="text-sm" style={{ color: 'rgb(148 150 180)' }}>
              Click "Upload Photos" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredSections.map(section => (
              <GallerySection
                key={section.gallery?._id || '__none__'}
                gallery={section.gallery}
                images={section.images}
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchData}
      />
    </>
  );
};

export default Dashboard;
