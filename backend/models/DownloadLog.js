import mongoose from 'mongoose';

const downloadLogSchema = new mongoose.Schema({
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);
export default DownloadLog;
