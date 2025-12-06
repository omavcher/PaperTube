// services/googleDriveService.js
const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveService {
  constructor() {
    this.drive = google.drive('v3');
    this.SCOPES = ['https://www.googleapis.com/auth/drive.file'];
  }

  // Get authenticated Google Drive instance
  async getDriveClient(userAccessToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userAccessToken });
    
    return google.drive({
      version: 'v3',
      auth
    });
  }

  // Upload PDF to user's Google Drive
  async uploadPDF(pdfBuffer, fileName, mimeType, userAccessToken) {
    try {
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

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
      });

      console.log("✅ File uploaded to Google Drive:", response.data.id);

      // Make the file publicly accessible for view link
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Get the file with updated permissions
      const file = await drive.files.get({
        fileId: response.data.id,
        fields: 'id, name, webViewLink, webContentLink, size, thumbnailLink'
      });

      return {
        fileId: file.data.id,
        fileName: file.data.name,
        viewLink: file.data.webViewLink,
        downloadLink: `${file.data.webContentLink}&export=download`,
        thumbnailLink: file.data.thumbnailLink,
        fileSize: file.data.size
      };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      
      // More detailed error information
      if (error.errors) {
        error.errors.forEach(err => {
          console.error('Drive API Error:', err.message);
        });
      }
      
      throw error;
    }
  }

  // Alternative upload method using simple multipart
  async uploadPDFSimple(pdfBuffer, fileName, mimeType, userAccessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userAccessToken });
      
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";
      
      const metadata = {
        name: fileName,
        mimeType: mimeType
      };
      
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n';
      
      // Convert buffer to base64
      const base64Data = pdfBuffer.toString('base64');
      const requestBody = multipartRequestBody + base64Data + closeDelim;
      
      const response = await auth.request({
        method: 'POST',
        url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size',
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"',
          'Content-Length': Buffer.byteLength(requestBody)
        },
        body: requestBody
      });
      
      const fileId = response.data.id;
      
      // Make file public
      await auth.request({
        method: 'POST',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
      
      // Get file details
      const fileResponse = await auth.request({
        method: 'GET',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink,size,thumbnailLink`
      });
      
      return {
        fileId: fileResponse.data.id,
        fileName: fileResponse.data.name,
        viewLink: fileResponse.data.webViewLink,
        downloadLink: `${fileResponse.data.webContentLink}&export=download`,
        thumbnailLink: fileResponse.data.thumbnailLink,
        fileSize: fileResponse.data.size
      };
      
    } catch (error) {
      console.error('Simple upload error:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId, userAccessToken) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      await drive.files.delete({
        fileId: fileId
      });
      
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  // Get file details
  async getFileDetails(fileId, userAccessToken) {
    try {
      const drive = await this.getDriveClient(userAccessToken);
      
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, webViewLink, webContentLink, size, thumbnailLink, createdTime, modifiedTime'
      });
      
      return file.data;
    } catch (error) {
      console.error('Error getting file details:', error);
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
        pageSize: 100
      });
      
      return response.data.files;
    } catch (error) {
      console.error('Error listing PDFs:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();