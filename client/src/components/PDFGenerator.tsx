// components/PDFGenerator.jsx
"use client";
import { useState } from 'react';
import api from '@/config/api';

export default function PDFGenerator({ noteId, noteTitle, onPDFGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      // Get Google access token from localStorage (stored during login)
      const authToken = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // You might need to store Google access token separately or get it from your backend
      // This depends on how you handle OAuth flow
      const googleAccessToken = localStorage.getItem('googleAccessToken');
      
      if (!googleAccessToken) {
        // If no Google token, request additional Drive permissions
        const { google } = await import('@react-oauth/google');
        // You'll need to implement a new Google login flow with Drive scope
        alert('Please grant Google Drive access to save PDFs');
        return;
      }

      const response = await api.get(`/pdf/generate?noteId=${noteId}`, {
        headers: {
          'x-google-access-token': googleAccessToken,
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        onPDFGenerated?.(response.data.data);
        
        // Show success with links
        alert(`PDF generated successfully!\n\nView: ${response.data.data.viewLink}\nDownload: ${response.data.data.downloadLink}`);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pdf-generator">
      <button
        onClick={generatePDF}
        disabled={generating}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {generating ? 'Generating PDF...' : 'Generate PDF to Google Drive'}
      </button>
      
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}