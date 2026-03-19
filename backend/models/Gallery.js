import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
