import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Image as ImageIcon, FolderOpen, ArrowUpRight,
  Layers, Search, TrendingUp, Images, Lock,
} from 'lucide-react';
import UploadModal from '../components/UploadModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import AccessControl from '../components/admin/AccessControl';

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

/* ─── Gallery Card (box/card style) ─────────────────────────── */
const GalleryCard = ({ gallery, images }) => {
  const coverImg = gallery?.resolvedCover
    ? `http://localhost:5000${gallery.resolvedCover}`
    : images[0]
      ? `http://localhost:5000${images[0].thumbnailUrl || images[0].url}`
      : null;

  const title = gallery?.title ?? 'Uncategorised';
  const count = images.length;
  const isPrivate = gallery?.isPrivate;
  const to = gallery ? `/galleries/${gallery._id}` : '#';

  return (
    <Link
      to={to}
      className="group block relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgb(255 255 255 / 0.04)',
        border: '1px solid rgb(255 255 255 / 0.08)',
        boxShadow: '0 2px 12px rgb(0 0 0 / 0.15)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 16px 40px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(139 92 246 / 0.25)';
        e.currentTarget.style.borderColor = 'rgb(139 92 246 / 0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgb(0 0 0 / 0.15)';
        e.currentTarget.style.borderColor = 'rgb(255 255 255 / 0.08)';
      }}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ background: 'rgb(255 255 255 / 0.03)' }}>
        {coverImg ? (
          <img
            src={coverImg}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgb(139 92 246 / 0.1), rgb(99 102 241 / 0.06))' }}
          >
            <Images className="w-10 h-10" style={{ color: 'rgb(139 92 246 / 0.3)' }} />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgb(10 10 20 / 0.7) 0%, transparent 55%)' }}
        />

        {/* Private badge */}
        {isPrivate && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgb(239 68 68 / 0.85)', backdropFilter: 'blur(8px)', color: '#fff' }}
          >
            <Lock className="w-3 h-3" /> Private
          </div>
        )}

        {/* Photo count badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgb(0 0 0 / 0.55)', backdropFilter: 'blur(8px)', color: 'rgb(220 220 240)' }}
          >
            {count} {count === 1 ? 'photo' : 'photos'}
          </span>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
        >
          <FolderOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {title}
          </h3>
          <p className="text-[11px]" style={{ color: 'rgb(148 150 180)' }}>
            {gallery?.event || gallery?.category || 'Gallery'}
          </p>
        </div>
        <ArrowUpRight
          className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: '#a78bfa' }}
        />
      </div>
    </Link>
  );
};

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [isUploadOpen, setIsUploadOpen]       = useState(false);
  const [totalImages, setTotalImages]         = useState(0);
  const [totalGalleries, setTotalGalleries]   = useState(0);
  const [gallerySections, setGallerySections] = useState([]);
  const [searchQuery, setSearchQuery]         = useState('');
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState('galleries');
  const { user } = useAuth();

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
        {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
            <button onClick={() => setActiveTab('galleries')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'galleries' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Galleries & Photos</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'users' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>User Management</button>
            <button onClick={() => setActiveTab('access')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'access' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Access Control</button>
          </div>
        )}

        {activeTab === 'users' ? <UserManagement /> : activeTab === 'access' ? <AccessControl /> : (
          <>
            {/* ── Page header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgb(148 150 180)' }}>
              All your galleries and images, organised for you
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

        {/* ── Gallery Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgb(255 255 255 / 0.04)', border: '1px solid rgb(255 255 255 / 0.07)' }}>
                <div className="w-full aspect-[4/3]" style={{ background: 'rgb(255 255 255 / 0.06)' }} />
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 rounded-full w-3/4" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
                    <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgb(255 255 255 / 0.05)' }} />
                  </div>
                </div>
              </div>
            ))}
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
              Click &quot;Upload Photos&quot; to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSections.map(section => (
              <GalleryCard
                key={section.gallery?._id || '__none__'}
                gallery={section.gallery}
                images={section.images}
              />
            ))}
          </div>
        )}
          </>
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
