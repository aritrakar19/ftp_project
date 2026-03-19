import { FtpSrv } from 'ftp-srv';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FtpImage from './models/FtpImage.js';

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
                const existingImage = await FtpImage.findOne({ filename });
                if (existingImage) {
                    console.log(`File ${filename} already exists in DB. Skipping.`);
                    return;
                }

                // Read image and convert to base64
                const fileData = fs.readFileSync(filePath);
                
                // Simple logic to handle image basic formats
                let mimeType = 'image/jpeg';
                if (filename.toLowerCase().endsWith('.png')) mimeType = 'image/png';
                else if (filename.toLowerCase().endsWith('.gif')) mimeType = 'image/gif';
                else if (filename.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
                else if (filename.toLowerCase().endsWith('.svg')) mimeType = 'image/svg+xml';

                // We construct the base64 URI
                const base64Str = `data:${mimeType};base64,${fileData.toString('base64')}`;

                // Save to DB
                const newImage = new FtpImage({
                    filename,
                    base64: base64Str
                });

                await newImage.save();
                console.log(`Successfully processed and saved image: ${filename}`);
                
            } catch (error) {
                console.error(`Error handling new file ${filePath}:`, error);
            }
        });

        console.log(`Watching for FTP uploads in ${UPLOAD_DIR}`);
    } catch (err) {
        console.error('Failed to start FTP server:', err);
    }
};
