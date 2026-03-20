import { FtpSrv } from 'ftp-srv';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Image from './models/Image.js';
import User from './models/User.js';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FTP_PORT = 2121;
// IP '0.0.0.0' allows external connections if you need to test outside. 
// For demo, 127.0.0.1 is fine.
const ftpServer = new FtpSrv({
    url: `ftp://127.0.0.1:${FTP_PORT}`,
    anonymous: true,
    pasv_url: '127.0.0.1'
});

const UPLOAD_DIR = path.join(__dirname, 'ftp-uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
    // Resolve with root directory to allow uploads
    resolve({ root: UPLOAD_DIR });
});

export const startFtpServer = async () => {
    try {
        await ftpServer.listen();
        console.log(`FTP Server listening on port ${FTP_PORT}`);
        
        // 2. Watch for new files
        const watcher = chokidar.watch(UPLOAD_DIR, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true, // Only react to new files, not existing ones initially
            awaitWriteFinish: {
                stabilityThreshold: 1000,
                pollInterval: 100
            }
        });

        watcher.on('add', async (filePath) => {
            console.log(`New file uploaded via FTP: ${filePath}`);
            try {
                const filename = path.basename(filePath);
                
                // Ignore duplicate files logic checks DB first
                const existingImage = await Image.findOne({ title: filename });
                if (existingImage) {
                    console.log(`File ${filename} already exists in DB. Skipping.`);
                    return;
                }

                // Find admin user or create system user to act as uploader
                let adminUser = await User.findOne({ role: 'admin' });
                if (!adminUser) {
                    adminUser = await User.create({ name: 'System FTP', email: 'system@ftp.local', role: 'admin' });
                }

                const uploadsDir = path.join(__dirname, 'uploads');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                if (!fs.existsSync(path.join(uploadsDir, 'thumbnails'))) fs.mkdirSync(path.join(uploadsDir, 'thumbnails'), { recursive: true });
                if (!fs.existsSync(path.join(uploadsDir, 'original'))) fs.mkdirSync(path.join(uploadsDir, 'original'), { recursive: true });

                const newFilename = `${Date.now()}-${filename.replace(/\\s+/g, '-')}`;
                const originalPath = path.join(uploadsDir, 'original', newFilename);
                const thumbnailPath = path.join(uploadsDir, 'thumbnails', newFilename);

                // Read image
                const fileBuf = fs.readFileSync(filePath);

                // Skip non-image files if sharp throws
                let metadata;
                try {
                  metadata = await sharp(fileBuf).metadata();
                } catch (e) {
                  console.log(`Skipping non-image file: ${filename}`);
                  return;
                }

                // Process image with sharp
                await sharp(fileBuf).toFile(originalPath);
                await sharp(fileBuf)
                  .resize(300, 300, { fit: 'inside' })
                  .toFile(thumbnailPath);
                
                let mimeType = 'image/jpeg';
                if (filename.toLowerCase().endsWith('.png')) mimeType = 'image/png';
                else if (filename.toLowerCase().endsWith('.gif')) mimeType = 'image/gif';
                else if (filename.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
                else if (filename.toLowerCase().endsWith('.svg')) mimeType = 'image/svg+xml';

                // Save to DB
                const newImage = new Image({
                    title: filename,
                    url: `/uploads/original/${newFilename}`,
                    thumbnailUrl: `/uploads/thumbnails/${newFilename}`,
                    tags: ['ftp-upload'],
                    event: 'FTP Bulk Upload',
                    uploadedBy: adminUser._id,
                    metadata: {
                        size: fs.statSync(filePath).size,
                        format: mimeType,
                        width: metadata.width,
                        height: metadata.height
                    }
                });

                await newImage.save();
                console.log(`Successfully processed and saved image: ${filename}`);
                
                // Optionally delete original ftp upload file to save space
                // fs.unlinkSync(filePath);
            } catch (error) {
                console.error(`Error handling new file ${filePath}:`, error);
            }
        });

        console.log(`Watching for FTP uploads in ${UPLOAD_DIR}`);
    } catch (err) {
        console.error('Failed to start FTP server:', err);
    }
};
