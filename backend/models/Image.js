import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  tags: [String],
  event: { type: String },
  galleryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  metadata: {
    size: Number,
    format: String,
    width: Number,
    height: Number
  }
}, { timestamps: true });

// Add text index for search
imageSchema.index({ tags: 'text', event: 'text', title: 'text' });

const Image = mongoose.model('Image', imageSchema);
export default Image;
