const { google } = require('googleapis'); // Import googleapis
const stream = require('stream'); // Import stream
const path = require('path'); // Import path

// Initialize with service account with correct scopes
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/service-account.json'),
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata'
  ]
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = '1bnlOQAwcVu71R238ixCOtP5icN0lSsKA'; // Replace with your actual Google Drive folder ID

const uploadFile = async (fileBuffer, fileName) => {
  try {
    console.log('Starting file upload to Google Drive...');
    
    // Verify folder exists and is accessible
    try {
      await drive.files.get({ fileId: FOLDER_ID });
    } catch (folderError) {
      console.error('Folder access error:', folderError);
      throw new Error('Unable to access destination folder. Please verify folder ID and permissions.');
    }
    
    // Create a readable stream from the buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: fileName,
      parents: [FOLDER_ID]
    };

    const media = {
      mimeType: 'application/pdf',
      body: bufferStream
    };

    console.log('Creating file in Google Drive...');
    
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    console.log('File created, setting permissions...');

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    console.log('Upload completed successfully');

    return {
      fileId: file.data.id,
      webViewLink: file.data.webViewLink
    };
  } catch (error) {
    console.error('Detailed Google Drive upload error:', error); // Add detailed error logging
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
};

module.exports = { uploadFile };
