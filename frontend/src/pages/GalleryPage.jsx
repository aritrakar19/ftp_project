import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import api from '../api/axios';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchImages = useCallback(async (pageNum = 1, searchQuery = '') => {
    try {
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const { data } = await api.get(`/images?pageNumber=${pageNum}&keyword=${searchQuery}`);
      
      if (pageNum === 1) {
        setImages(data.images);
      } else {
        setImages((prev) => [...prev, ...data.images]);
      }
      
      setTotalPages(data.pages);
      setLoading(false);
      setFetchingMore(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchImages(1, keyword);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [keyword, fetchImages]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      fetchImages(page + 1, keyword);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Collections</h1>
          <p className="text-gray-500 mt-1">Explore carefully curated high-quality images</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
            placeholder="Search by tags, events, or keywords..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <ImageGallery images={images} />
          
          {page < totalPages && (
            <div className="flex justify-center pt-8 pb-4">
              <button
                onClick={loadMore}
                disabled={fetchingMore}
                className="bg-white border rounded-full px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {fetchingMore ? 'Loading more...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalleryPage;
