import Gallery from '../models/Gallery.js';
import Image from '../models/Image.js';

// @desc    Get all galleries (with image counts)
// @route   GET /api/galleries
// @access  Private
export const getGalleries = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { allowedUsers: req.user._id }] };

    const galleries = await Gallery.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Attach image count to each gallery
    const galleriesWithCount = await Promise.all(
      galleries.map(async (g) => {
        const imageCount = await Image.countDocuments({ galleryId: g._id });
        // Resolve coverImage: if no coverImage set, pick the latest image's thumbnailUrl
        let resolvedCover = g.coverImage || null;
        if (!resolvedCover) {
          const latest = await Image.findOne({ galleryId: g._id }).sort({ createdAt: -1 }).select('thumbnailUrl url');
          if (latest) resolvedCover = latest.thumbnailUrl || latest.url;
        }
        return {
          ...g.toObject(),
          imageCount,
          resolvedCover,
        };
      })
    );

    res.json(galleriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a gallery
// @route   POST /api/galleries
// @access  Private
export const createGallery = async (req, res) => {
  const { title, description, coverImage, allowedUsers, isPrivate, category } = req.body;

  try {
    const gallery = new Gallery({
      title,
      description,
      coverImage,
      isPrivate: !!isPrivate,
      category: category || 'Other',
      allowedUsers: allowedUsers || [],
      createdBy: req.user._id,
    });

    const createdGallery = await gallery.save();
    res.status(201).json(createdGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a gallery
// @route   DELETE /api/galleries/:id
// @access  Private/Admin
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (gallery) {
      await gallery.deleteOne();
      res.json({ message: 'Gallery removed' });
    } else {
      res.status(404).json({ message: 'Gallery not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
