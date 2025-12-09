// components/PDFGenerator.jsx
"use client";
import { useState } from 'react';
import api from '@/config/api';

export default function PDFGenerator({ noteId, noteTitle, onPDFGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);

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
        const pdfData = response.data.data;
        setPdfInfo(pdfData);
        
        // Extract the actual PDF data - handle both response formats
        const pdfDataToStore = pdfData.pdf_data || pdfData;
        
        onPDFGenerated?.(pdfDataToStore);
        
        // Show success message with appropriate text based on response
        const message = response.data.message.includes('already')
          ? 'PDF already exists!'
          : 'PDF generated successfully!';
        
        showPDFLinksModal(pdfDataToStore, message);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      const errorMsg = err.response?.data?.message || 'Failed to generate PDF';
      setError(errorMsg);
      
      // If error is about missing Google Drive permissions
      if (errorMsg.includes('Google') || errorMsg.includes('Drive')) {
        handleGoogleAuth();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGoogleAuth = () => {
    // Implement Google OAuth with drive.file scope
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&
      redirect_uri=${window.location.origin}/auth/google/callback&
      response_type=token&
      scope=https://www.googleapis.com/auth/drive.file&
      include_granted_scopes=true&
      state=generate_pdf_${noteId}`;
    
    localStorage.setItem('pdf_note_id', noteId);
    window.location.href = googleAuthUrl;
  };

  const showPDFLinksModal = (pdfData, title) => {
    // Create a modal or use a toast notification with links
    const modalHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">${title}</h3>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">
              <strong>File:</strong> ${pdfData.fileName}
            </p>
            <p class="text-sm text-gray-600 mb-4">
              <strong>Size:</strong> ${formatFileSize(pdfData.fileSize)}
            </p>
          </div>
          
          <div class="space-y-3">
            <a href="${pdfData.viewLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="block w-full px-4 py-2 bg-blue-100 text-blue-700 rounded text-center hover:bg-blue-200 transition">
              👁️ View in Google Drive
            </a>
            
            <a href="${pdfData.downloadLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="block w-full px-4 py-2 bg-green-100 text-green-700 rounded text-center hover:bg-green-200 transition">
              ⬇️ Download PDF
            </a>
            
            ${pdfData.thumbnailLink ? `
            <div class="mt-4 p-3 bg-gray-50 rounded">
              <p class="text-sm text-gray-600 mb-2">Preview:</p>
              <img src="${pdfData.thumbnailLink}" 
                   alt="PDF thumbnail" 
                   class="mx-auto border rounded shadow-sm"/>
            </div>
            ` : ''}
          </div>
          
          <button onclick="this.closest('.fixed').remove()"
                  class="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Close
          </button>
        </div>
      </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHtml;
    document.body.appendChild(modalDiv);
  };

  const formatFileSize = (bytes) => {
    if (typeof bytes === 'string') bytes = parseInt(bytes);
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if PDF already exists on component mount
  useEffect(() => {
    checkExistingPDF();
  }, [noteId]);

  const checkExistingPDF = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await api.get(`/pdf/check?noteId=${noteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.data.success && response.data.data) {
        setPdfInfo(response.data.data);
      }
    } catch (err) {
      // Silently fail - PDF might not exist yet
    }
  };

  return (
    <div className="pdf-generator space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={generatePDF}
          disabled={generating}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {generating ? (
            <>
              <span className="animate-spin">⟳</span>
              Generating...
            </>
          ) : pdfInfo ? (
            <>
              <span>📄</span>
              Regenerate PDF
            </>
          ) : (
            <>
              <span>🔄</span>
              Generate PDF to Drive
            </>
          )}
        </button>
        
        {pdfInfo && (
          <button
            onClick={() => showPDFLinksModal(pdfInfo.pdf_data || pdfInfo, 'Existing PDF')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
          >
            <span>👁️</span>
            View PDF
          </button>
        )}
      </div>
      
      {pdfInfo && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Existing PDF:</span>{' '}
            {pdfInfo.fileName || (pdfInfo.pdf_data?.fileName)}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Last updated: {new Date(pdfInfo.uploadedAt || pdfInfo.generatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          {error.includes('Google') && (
            <button
              onClick={handleGoogleAuth}
              className="mt-2 text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Grant Google Drive permissions
            </button>
          )}
        </div>
      )}
    </div>
  );
}