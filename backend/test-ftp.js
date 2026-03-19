import * as ftp from 'basic-ftp';
import fs from 'fs';

async function testUpload() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: '127.0.0.1',
            port: 2121,
        });
        
        // Create a dummy image file
        fs.writeFileSync('dummy.jpg', 'fake-image-data-xyz');
        
        await client.uploadFrom('dummy.jpg', 'dummy.jpg');
        console.log('Upload successful!');
        
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
        if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
    }
}

testUpload();
