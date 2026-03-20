import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import Image from '../models/Image.js';
import DownloadLog from '../models/DownloadLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure upload directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'thumbnails'))) fs.mkdirSync(path.join(uploadsDir, 'thumbnails'), { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'original'))) fs.mkdirSync(path.join(uploadsDir, 'original'), { recursive: true });

// @desc    Upload an image
// @route   POST /api/images
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const filename = `${Date.now()}-${req.file.originalname.replace(/\\s+/g, '-')}`;
    const originalPath = path.join(uploadsDir, 'original', filename);
    const thumbnailPath = path.join(uploadsDir, 'thumbnails', filename);

    // Save original image
    await sharp(req.file.buffer).toFile(originalPath);

    // Save thumbnail
    await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'inside' })
      .toFile(thumbnailPath);

    const image = new Image({
      title: req.body.title || req.file.originalname,
      url: `/uploads/original/${filename}`,
      thumbnailUrl: `/uploads/thumbnails/${filename}`,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      event: req.body.event || '',
      galleryId: req.body.galleryId || null,
      uploadedBy: req.user._id,
      metadata: {
        size: req.file.size,
        format: req.file.mimetype,
      }
    });

    const createdImage = await image.save();
    res.status(201).json(createdImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all images with pagination and search
// @route   GET /api/images
// @access  Public
export const getImages = async (req, res) => {
  const Gallery = (await import('../models/Gallery.js')).default;
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
          { event: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  try {
    let allowedGalleryIds = [];
    if (req.user.role !== 'admin') {
      const galleries = await Gallery.find({
        $or: [{ createdBy: req.user._id }, { allowedUsers: req.user._id }]
      }).select('_id');
      allowedGalleryIds = galleries.map(g => g._id);
    } else {
      const galleries = await Gallery.find({}).select('_id');
      allowedGalleryIds = galleries.map(g => g._id);
    }

    if (req.query.galleryId) {
      if (req.user.role !== 'admin' && !allowedGalleryIds.some(id => id.toString() === req.query.galleryId)) {
        return res.status(403).json({ message: 'Access denied to this gallery' });
      }
      keyword.galleryId = req.query.galleryId;
    } else {
      keyword.galleryId = { $in: allowedGalleryIds };
    }

    const count = await Image.countDocuments({ ...keyword });
    const images = await Image.find({ ...keyword })
      .populate('uploadedBy', 'name')
      .populate('galleryId', 'title')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ images, page, pages: Math.ceil(count / pageSize), count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log image download
// @route   POST /api/images/:id/download
// @access  Private
export const logDownload = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).populate('galleryId');
    if (!image) return res.status(404).json({ message: 'Image not found' });

    if (req.user.role !== 'admin') {
      const isAllowed = image.galleryId && image.galleryId.allowedUsers && image.galleryId.allowedUsers.includes(req.user._id);
      if (!isAllowed) {
        return res.status(403).json({ message: 'Not authorized to download this image' });
      }
    }

    const log = new DownloadLog({
      imageId: req.params.id,
      userId: req.user._id
    });
    await log.save();
    
    // In a real app we might redirect to a signed URL, for local we just confirm
    res.json({ message: 'Download logged successfully', url: image.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
