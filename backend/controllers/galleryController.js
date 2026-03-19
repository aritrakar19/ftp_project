import Gallery from '../models/Gallery.js';

// @desc    Get all galleries
// @route   GET /api/galleries
// @access  Public
export const getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find({}).populate('createdBy', 'name');
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a gallery
// @route   POST /api/galleries
// @access  Private/Admin
export const createGallery = async (req, res) => {
  const { title, description, coverImage } = req.body;

  try {
    const gallery = new Gallery({
      title,
      description,
      coverImage,
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
