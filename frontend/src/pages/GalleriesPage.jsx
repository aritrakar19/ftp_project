import { useState, useEffect } from 'react';
import { Search, Layers, Trophy, Award, Archive, Globe, ChevronRight } from 'lucide-react';
import GalleryCard from '../components/GalleryCard';
import api from '../api/axios';


/* ─── Skeleton card ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgb(255 255 255 / 0.04)', border: '1px solid rgb(255 255 255 / 0.07)' }}>
    <div className="w-full aspect-[4/3]" style={{ background: 'rgb(255 255 255 / 0.06)' }} />
    <div className="px-3 py-3 space-y-2">
      <div className="h-3.5 rounded-full w-3/4" style={{ background: 'rgb(255 255 255 / 0.08)' }} />
      <div className="h-2.5 rounded-full w-1/3" style={{ background: 'rgb(255 255 255 / 0.05)' }} />
    </div>
  </div>
);

/* ─── GalleriesPage ─────────────────────────────────────────────── */
const GalleriesPage = () => {
  const [galleries, setGalleries]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]               = useState('');

  // The Categories section should display the static 'All Galleries' plus every created gallery
  // Since the user wants galleries to appear in the Categories section directly.
  const dynamicCategories = [
    { id: 'all', label: 'All Galleries', icon: Globe },
    ...galleries.map(g => ({ id: g._id, label: g.title, icon: Layers }))
  ];

  useEffect(() => {
    const fetchGalleries = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/galleries');
        setGalleries(data);
      } catch (err) {
        console.error('Failed to load galleries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  /* Filter by chosen "Category" (which is now either 'all' or a specific gallery ID) + search query */
  const filtered = galleries.filter(g => {
    const matchCat = activeCategory === 'all' || g._id === activeCategory;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Count per "category" (gallery)
     Wait, if the category IS the gallery, the count could be the number of images it has!
     The user wants to see the gallery along with its count.
  */
  const countFor = (id) => {
    if (id === 'all') return galleries.reduce((sum, g) => sum + (g.imageCount || 0), 0);
    const g = galleries.find(x => x._id === id);
    return g ? (g.imageCount || 0) : 0;
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ══════════ Sidebar ══════════ */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 pt-8 pr-4"
        style={{ borderRight: '1px solid rgb(255 255 255 / 0.07)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4 px-3"
          style={{ color: 'rgb(148 150 180)' }}>
          Categories
        </p>

        <nav className="space-y-0.5" style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
          {dynamicCategories.map(({ id, label, icon: Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                id={`sidebar-cat-${id}`}
                onClick={() => setActiveCategory(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left"
                style={{
                  background: active ? 'rgb(139 92 246 / 0.15)' : 'transparent',
                  color: active ? '#a78bfa' : 'rgb(148 150 180)',
                  border: active ? '1px solid rgb(139 92 246 / 0.25)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgb(255 255 255 / 0.04)';
                    e.currentTarget.style.color = 'rgb(248 248 255)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgb(148 150 180)';
                  }
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <span
                  className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgb(139 92 246 / 0.25)' : 'rgb(255 255 255 / 0.06)',
                    color: active ? '#c4b5fd' : 'rgb(100 100 130)',
                  }}
                >
                  {countFor(id)}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ══════════ Main content ══════════ */}
      <main className="flex-1 min-w-0 pl-0 md:pl-8 pt-8 pb-12">

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {dynamicCategories.find(c => c.id === activeCategory)?.label ?? 'All Galleries'}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'rgb(148 150 180)' }}>
              {loading ? '—' : `${filtered.length} ${filtered.length === 1 ? 'gallery' : 'galleries'}`}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgb(148 150 180)' }} />
            <input
              id="galleries-search"
              type="text"
              className="field pl-10 text-sm"
              placeholder="Search galleries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile: horizontal category pills */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1 scrollbar-none">
          {dynamicCategories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: activeCategory === id ? 'rgb(139 92 246)' : 'rgb(255 255 255 / 0.06)',
                color: activeCategory === id ? '#fff' : 'rgb(148 150 180)',
                border: activeCategory === id ? 'none' : '1px solid rgb(255 255 255 / 0.08)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ border: '2px dashed rgb(255 255 255 / 0.08)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgb(139 92 246 / 0.1)' }}>
              <Layers className="w-7 h-7" style={{ color: 'rgb(139 92 246 / 0.5)' }} />
            </div>
            <p className="font-semibold text-white mb-1">No galleries found</p>
            <p className="text-sm" style={{ color: 'rgb(148 150 180)' }}>
              {search ? 'Try a different search term.' : 'Create a gallery to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(g => (
              <GalleryCard key={g._id} gallery={g} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GalleriesPage;
