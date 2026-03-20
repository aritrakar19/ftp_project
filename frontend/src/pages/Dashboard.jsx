import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, FolderOpen, ArrowUpRight, Layers, Search } from 'lucide-react';
import UploadModal from '../components/UploadModal';
import api from '../api/axios';

// ─── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo' }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    sky:    { bg: 'bg-sky-50',    text: 'text-sky-600'    },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
          </span>
        )}
      </div>
      <p className="text-gray-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
    </div>
  );
};

// ─── Single gallery section ──────────────────────────────────────────────────
const GallerySection = ({ gallery, images }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Gallery header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-indigo-50/60 to-transparent">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{gallery?.title ?? 'Uncategorised'}</h2>
          <p className="text-xs text-gray-400">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>

    {/* Image grid */}
    {images.length === 0 ? (
      <div className="flex items-center justify-center h-28 text-gray-400 text-sm">No images yet</div>
    ) : (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 p-1">
        {images.map(img => (
          <div
            key={img._id}
            className="relative aspect-square overflow-hidden bg-gray-100 group rounded-lg"
          >
            <img
              src={`http://localhost:5000${img.thumbnailUrl || img.url}`}
              alt={img.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-1.5">
              <p className="text-white text-[10px] font-medium leading-tight truncate w-full">{img.title}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Dashboard page ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [totalGalleries, setTotalGalleries] = useState(0);
  const [gallerySections, setGallerySections] = useState([]); // [{gallery, images}]
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch galleries and all images in parallel
      const [galleriesRes, imagesRes] = await Promise.all([
        api.get('/galleries'),
        api.get('/images?pageSize=200'), // fetch enough for dashboard overview
      ]);

      const galleries = galleriesRes.data || [];
      const images = imagesRes.data.images || [];
      setTotalImages(imagesRes.data.count || images.length);
      setTotalGalleries(galleries.length);

      // Group images by galleryId
      const galleryMap = new Map();
      // Pre-populate with known galleries (even empty ones)
      galleries.forEach(g => galleryMap.set(g._id, { gallery: g, images: [] }));
      // Add ungrouped bucket
      galleryMap.set('__none__', { gallery: null, images: [] });

      images.forEach(img => {
        const gid = img.galleryId?._id || img.galleryId || '__none__';
        if (galleryMap.has(gid)) {
          galleryMap.get(gid).images.push(img);
        } else {
          galleryMap.get('__none__').images.push(img);
        }
      });

      // Build ordered array: known galleries first, ungrouped last
      const sections = [...galleryMap.values()].filter(
        s => s.gallery !== null || s.images.length > 0
      );

      setGallerySections(sections);
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Client-side search filter across all sections
  const filteredSections = gallerySections
    .map(section => ({
      ...section,
      images: searchQuery
        ? section.images.filter(img =>
            img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            img.event?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : section.images
    }))
    .filter(s => !searchQuery || s.images.length > 0);

  return (
    <>
      <div className="space-y-8">

        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">All your images, organised by gallery</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all flex items-center shadow-md hover:-translate-y-0.5 transform focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Photos
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Photos"
            value={loading ? '…' : totalImages}
            icon={ImageIcon}
            color="indigo"
          />
          <StatCard
            title="Total Galleries"
            value={loading ? '…' : totalGalleries}
            icon={Layers}
            color="violet"
          />
          <StatCard
            title="Recent Upload"
            value={loading ? '…' : (gallerySections.find(s => s.images.length > 0)?.images[0]?.title?.substring(0, 14) + '…' || '—')}
            icon={FolderOpen}
            color="sky"
          />
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-sm bg-white transition-all"
            placeholder="Search by filename, tag, or event…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Gallery-wise image sections */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
            <ImageIcon className="w-14 h-14 text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No photos yet. Click "Upload Photos" to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((section, idx) => (
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
