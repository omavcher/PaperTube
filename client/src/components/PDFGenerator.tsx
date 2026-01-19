// components/PDFGenerator.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/config/api';
import { formatFileSize, showPDFLinksModal } from '@/utils/pdfUtils'; // Helper functions

export default function PDFGenerator({ noteId, noteTitle, onPDFGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [showThumbnail, setShowThumbnail] = useState(false);

  // Check if PDF already exists on component mount
  useEffect(() => {
    checkExistingPDF();
  }, [noteId]);

  const checkExistingPDF = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.get(`/pdf/check?noteId=${noteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.data.success && response.data.data) {
        // Normalize the response data structure
        const pdfData = response.data.data;
        setPdfInfo({
          ...pdfData,
          // Ensure we have consistent structure
          viewLink: pdfData.viewLink || pdfData.pdf_data?.viewLink,
          downloadLink: pdfData.downloadLink || pdfData.pdf_data?.downloadLink,
          thumbnailLink: pdfData.thumbnailLink || pdfData.pdf_data?.thumbnailLink,
          fileName: pdfData.fileName || pdfData.pdf_data?.fileName,
          fileSize: pdfData.fileSize || pdfData.pdf_data?.fileSize,
          uploadedAt: pdfData.uploadedAt || pdfData.generatedAt || pdfData.pdf_data?.uploadedAt
        });
      }
    } catch (err) {
      // Silently fail - PDF might not exist yet
      console.log('No existing PDF found');
    }
  }, [noteId]);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      // Get auth tokens
      const authToken = localStorage.getItem('authToken');
      const googleAccessToken = localStorage.getItem('googleAccessToken');
      
      if (!googleAccessToken) {
        // Trigger Google OAuth with drive scope
        handleGoogleAuth();
        return;
      }

      const response = await api.get(`/pdf/generate?noteId=${noteId}`, {
        headers: {
          'x-google-access-token': googleAccessToken,
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        
        // Normalize the response structure
        const normalizedData = {
          fileId: responseData.fileId || responseData.pdf_data?.fileId,
          fileName: responseData.fileName || responseData.pdf_data?.fileName,
          viewLink: responseData.viewLink || responseData.pdf_data?.viewLink,
          downloadLink: responseData.downloadLink || responseData.pdf_data?.downloadLink,
          thumbnailLink: responseData.thumbnailLink || responseData.pdf_data?.thumbnailLink,
          fileSize: responseData.fileSize || responseData.pdf_data?.fileSize,
          uploadedAt: responseData.uploadedAt || responseData.generatedAt || responseData.pdf_data?.uploadedAt,
          noteTitle: responseData.noteTitle || noteTitle,
          // Keep original data structure for backward compatibility
          ...responseData
        };

        setPdfInfo(normalizedData);
        
        // Callback with normalized data
        onPDFGenerated?.(normalizedData);
        
        // Show success message
        const message = response.data.message.includes('already')
          ? '📄 PDF Already Exists!'
          : '✅ PDF Generated Successfully!';
        
        // Show modal with PDF options
        showPDFLinksModal(normalizedData, message, response.data.message);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to generate PDF';
      setError(errorMsg);
      
      // If error is about missing Google Drive permissions
      if (errorMsg.includes('Google') || errorMsg.includes('Drive') || errorMsg.includes('permission')) {
        handleGoogleAuth();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGoogleAuth = () => {
    // Implement Google OAuth with drive.file scope
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setError('Google Client ID not configured');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/drive.file';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `include_granted_scopes=true&` +
      `state=pdf_generate_${noteId}&` +
      `prompt=consent`;
    
    // Store noteId for after auth callback
    localStorage.setItem('pdf_note_id', noteId);
    localStorage.setItem('pdf_note_title', noteTitle);
    localStorage.setItem('pdf_redirect_url', window.location.href);
    
    // Redirect to Google OAuth
    window.location.href = googleAuthUrl;
  };

  const handleViewInNewTab = () => {
    if (pdfInfo?.viewLink) {
      window.open(pdfInfo.viewLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadPDF = () => {
    if (pdfInfo?.downloadLink) {
      const link = document.createElement('a');
      link.href = pdfInfo.downloadLink;
      link.download = pdfInfo.fileName || 'document.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreviewPDF = () => {
    if (pdfInfo?.viewLink) {
      // Create a modal for PDF preview
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold text-gray-800">PDF Preview - ${pdfInfo.fileName}</h3>
            <button onclick="this.closest('.fixed').remove()" 
                    class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div class="flex-1 overflow-hidden">
            <iframe 
              src="${pdfInfo.viewLink.replace('/view?', '/preview?')}" 
              class="w-full h-full border-0"
              title="PDF Preview"
              allow="autoplay">
            </iframe>
          </div>
          <div class="p-4 border-t bg-gray-50 flex justify-between items-center">
            <span class="text-sm text-gray-600">Size: ${formatFileSize(pdfInfo.fileSize)}</span>
            <div class="space-x-2">
              <button onclick="window.open('${pdfInfo.viewLink}', '_blank')"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Open in Drive
              </button>
              <button onclick="this.closest('.fixed').remove()"
                      class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  };

  const toggleThumbnail = () => {
    setShowThumbnail(!showThumbnail);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="pdf-generator space-y-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Export to PDF</h3>
          <p className="text-sm text-gray-600">Generate a PDF and save to Google Drive</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generatePDF}
            disabled={generating}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[180px] justify-center"
          >
            {generating ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Generating...
              </>
            ) : pdfInfo ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate PDF
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Existing PDF Info */}
      {pdfInfo && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <h4 className="font-semibold text-blue-800">PDF Available</h4>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Ready
                </span>
              </div>
              
              <p className="text-sm text-gray-700 truncate">
                <span className="font-medium">File:</span> {pdfInfo.fileName}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(pdfInfo.uploadedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {formatFileSize(pdfInfo.fileSize)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {pdfInfo.thumbnailLink && (
                <button
                  onClick={toggleThumbnail}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {showThumbnail ? 'Hide Thumbnail' : 'Show Thumbnail'}
                </button>
              )}
              
              <button
                onClick={handlePreviewPDF}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              
              <button
                onClick={handleViewInNewTab}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Thumbnail Preview */}
          {showThumbnail && pdfInfo.thumbnailLink && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail Preview:</p>
              <div className="flex justify-center">
                <img 
                  src={pdfInfo.thumbnailLink} 
                  alt="PDF Thumbnail" 
                  className="max-w-full h-auto rounded shadow-sm border max-h-48 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x280?text=Thumbnail+Not+Available';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Error Generating PDF</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {(error.includes('Google') || error.includes('Drive') || error.includes('permission')) && (
                <button
                  onClick={handleGoogleAuth}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Grant Google Drive Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PDFs are generated and stored in your Google Drive. You need to grant Drive permissions once.
        </p>
      </div>
    </div>
  );
}

// Helper utility functions (create a separate utils/pdfUtils.js file)
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  if (typeof bytes === 'string') bytes = parseInt(bytes);
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const showPDFLinksModal = (pdfData, title, message) => {
  // You can implement a proper modal using a state-based solution
  // For now, using a simple alert with options
  const modalHtml = `
    <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">${title}</h3>
            <button onclick="this.closest('.fixed').remove()" 
                    class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          
          <div class="mb-6">
            <p class="text-green-600 font-medium mb-2">${message}</p>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-700 truncate">
                <strong>📄 File:</strong> ${pdfData.fileName}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                <strong>📊 Size:</strong> ${formatFileSize(pdfData.fileSize)}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                <strong>🕒 Generated:</strong> ${new Date(pdfData.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div class="space-y-3">
            <a href="${pdfData.viewLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium">
              👁️ View in Google Drive
            </a>
            
            <a href="${pdfData.downloadLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium">
              ⬇️ Download PDF
            </a>
            
            <button onclick="this.closest('.fixed').remove()"
                    class="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHtml;
  document.body.appendChild(modalDiv);
};