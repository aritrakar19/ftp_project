import mongoose from 'mongoose';

const ftpImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  base64: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FtpImage = mongoose.model('FtpImage', ftpImageSchema);
export default FtpImage;
