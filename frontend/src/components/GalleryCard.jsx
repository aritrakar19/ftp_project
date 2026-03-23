import { Link } from 'react-router-dom';
import { Lock, Images } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const GalleryCard = ({ gallery }) => {
  const { _id, title, imageCount = 0, isPrivate, resolvedCover } = gallery;

  return (
    <Link
      to={`/galleries/${_id}`}
      id={`gallery-card-${_id}`}
      className="gallery-card group block relative rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5">
        {resolvedCover ? (
          <LazyLoadImage
            alt={title}
            src={`http://localhost:5000${resolvedCover}`}
            effect="opacity"
            wrapperClassName="w-full h-full block"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          /* Placeholder when no cover image */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgb(139 92 246 / 0.12), rgb(99 102 241 / 0.08))' }}>
            <Images className="w-10 h-10" style={{ color: 'rgb(139 92 246 / 0.4)' }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgb(10 10 20 / 0.85) 0%, rgb(10 10 20 / 0.3) 50%, transparent 100%)',
            opacity: 0.7,
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgb(139 92 246 / 0.12)' }}
        />

        {/* Lock badge */}
        {isPrivate && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'rgb(239 68 68 / 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
            }}
          >
            <Lock className="w-3 h-3" />
            Private
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <h3 className="text-sm font-semibold text-white truncate leading-snug group-hover:text-purple-300 transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgb(148 150 180)' }}>
          {imageCount} {imageCount === 1 ? 'Image' : 'Images'}
        </p>
      </div>
    </Link>
  );
};

export default GalleryCard;
