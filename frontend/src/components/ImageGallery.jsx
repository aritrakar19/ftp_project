import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from "yet-another-react-lightbox/plugins/download";
import api from '../api/axios';

const ImageGallery = ({ images }) => {
  const [index, setIndex] = useState(-1);

  const handleClick = (index) => setIndex(index);
  const handleClose = () => setIndex(-1);

  const handleDownload = async (url, id) => {
    try {
      // Log download if needed
      await api.post(`/images/${id}/download`);
    } catch (error) {
      console.error('Failed to log download', error);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium text-gray-500">No images found</p>
      </div>
    );
  }

  const slides = images.map((img) => ({
    src: `http://localhost:5000${img.url}`,
    title: img.title || 'Untitled',
    description: img.tags?.join(', ') || '',
    imageId: img._id
  }));

  return (
    <>
      <div className="masonry-grid">
        {images.map((img, i) => (
          <div 
            key={img._id} 
            className="masonry-item relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 hover-trigger mb-4 shadow-sm hover:shadow-lg transition-all duration-300"
            onClick={() => handleClick(i)}
          >
            <LazyLoadImage
              alt={img.title}
              src={`http://localhost:5000${img.thumbnailUrl}`}
              effect="blur"
              wrapperClassName="w-full h-full block"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent hover-target flex flex-col justify-end p-4">
              <h3 className="text-white font-medium truncate drop-shadow-md">
                {img.title || 'Untitled'}
              </h3>
              {img.tags && img.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {img.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {tag}
                    </span>
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
        close={handleClose}
        slides={slides}
        plugins={[Zoom, Download]}
        on={{
          download: ({ slide }) => {
            handleDownload(slide.src, slide.imageId);
          }
        }}
      />
    </>
  );
};

export default ImageGallery;
