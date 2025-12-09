// services/googleDriveService.js
const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveService {
  constructor() {
    this.drive = google.drive('v3');
    this.SCOPES = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata'
    ];
  }

  // Validate and refresh token if needed
  async validateAndRefreshToken(userAccessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userAccessToken });
      
      // Check if token is expired
      const tokenInfo = await auth.getTokenInfo(userAccessToken);
      
      // If token is about to expire or already expired, you might need to refresh it
      // Note: You cannot refresh tokens without a refresh token
      console.log('Token info:', {
        expires_in: tokenInfo.expires_in,
        scopes: tokenInfo.scopes
      });
      
      return auth;
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new Error(`Invalid or expired Google access token: ${error.message}`);
    }
  }

  // Get authenticated Google Drive instance with better error handling
  async getDriveClient(userAccessToken) {
    try {
      const auth = await this.validateAndRefreshToken(userAccessToken);
      
      return google.drive({
        version: 'v3',
        auth
      });
    } catch (error) {
      console.error('Error getting Drive client:', error);
      throw new Error(`Failed to authenticate with Google Drive: ${error.message}`);
    }
  }

  // Upload PDF to user's Google Drive with retry logic
  async uploadPDF(pdfBuffer, fileName, mimeType, userAccessToken) {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Upload attempt ${retryCount + 1} for file: ${fileName}`);
        
        const drive = await this.getDriveClient(userAccessToken);
        
        // Convert buffer to readable stream
        const bufferStream = new stream.PassThrough();
        bufferStream.end(pdfBuffer);

        const fileMetadata = {
          name: fileName,
          mimeType: mimeType,
        };

        const media = {
          mimeType: mimeType,
          body: bufferStream,
        };

        // Upload file
        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name, webViewLink, webContentLink, size',
          supportsAllDrives: true,
        });

        console.log("✅ File uploaded to Google Drive:", response.data.id);

        // Make the file publicly accessible for view link
        try {
          await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            },
            supportsAllDrives: true,
          });
        } catch (permError) {
          console.warn('Warning: Could not set public permissions:', permError.message);
          // Continue even if permissions fail
        }

        // Get the file with updated permissions
        const file = await drive.files.get({
          fileId: response.data.id,
          fields: 'id, name, webViewLink, webContentLink, size, thumbnailLink',
          supportsAllDrives: true,
        });

        return {
          fileId: file.data.id,
          fileName: file.data.name,
          viewLink: file.data.webViewLink,
          downloadLink: file.data.webContentLink ? 
            `${file.data.webContentLink}&export=download` : null,
          thumbnailLink: file.data.thumbnailLink,
          fileSize: file.data.size,
          success: true
        };
        
      } catch (error) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          console.error('Max retries reached. Upload failed:', error);
          
          // Provide more helpful error messages
          let errorMessage = 'Failed to upload to Google Drive';
          
          if (error.code === 401) {
            errorMessage = 'Google access token is invalid or expired. Please re-authenticate.';
          } else if (error.code === 403) {
            errorMessage = 'Insufficient permissions to upload to Google Drive.';
          } else if (error.message.includes('invalid authentication credentials')) {
            errorMessage = 'Google authentication failed. Please check your access token.';
          }
          
          throw new Error(`${errorMessage} (Original: ${error.message})`);
        }
        
        console.log(`Retrying upload... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  // Alternative: Upload to a specific folder
  async uploadToFolder(pdfBuffer, fileName, mimeType, userAccessToken, folderId = null) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);

      const fileMetadata = {
        name: fileName,
        mimeType: mimeType,
      };

      // Add folder ID if provided
      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
        supportsAllDrives: true,
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        viewLink: response.data.webViewLink,
        downloadLink: response.data.webContentLink ? 
          `${response.data.webContentLink}&export=download` : null,
        fileSize: response.data.size,
        success: true
      };
      
    } catch (error) {
      console.error('Folder upload error:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId, userAccessToken) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      await drive.files.delete({
        fileId: fileId,
        supportsAllDrives: true,
      });
      
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  // Get file details with better error handling
  async getFileDetails(fileId, userAccessToken) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, webViewLink, webContentLink, size, thumbnailLink, createdTime, modifiedTime',
        supportsAllDrives: true,
      });
      
      return {
        ...file.data,
        downloadLink: file.data.webContentLink ? 
          `${file.data.webContentLink}&export=download` : null
      };
    } catch (error) {
      if (error.code === 404) {
        throw new Error('File not found in Google Drive');
      }
      console.error('Error getting file details:', error);
      throw error;
    }
  }

  // Check if file exists
  async checkFileExists(fileId, userAccessToken) {
    try {
      await this.getFileDetails(fileId, userAccessToken);
      return true;
    } catch (error) {
      if (error.message.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

  // List user's PDF files
  async listUserPDFs(userAccessToken) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      const response = await drive.files.list({
        q: "mimeType='application/pdf' and trashed=false",
        fields: 'files(id, name, webViewLink, webContentLink, size, thumbnailLink, createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 100,
        supportsAllDrives: true,
      });
      
      return response.data.files.map(file => ({
        ...file,
        downloadLink: file.webContentLink ? 
          `${file.webContentLink}&export=download` : null
      }));
    } catch (error) {
      console.error('Error listing PDFs:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();