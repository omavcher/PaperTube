"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChartGenerationTester = () => {
  const [noteId, setNoteId] = useState('');
  const [chartRequest, setChartRequest] = useState('');
  const [sessions, setSessions] = useState([]);
  const [currentChart, setCurrentChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modelStatus, setModelStatus] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Base URL for API
  const API_BASE = '/api/chart';

  // Fetch model status
  const fetchModelStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/charts/status`);
      setModelStatus(response.data);
      setMessage('Model status fetched successfully');
    } catch (error) {
      setMessage('Error fetching model status: ' + error.response?.data?.error || error.message);
    }
  };

  // Fetch chart sessions for a note
  const fetchChartSessions = async () => {
    if (!noteId) {
      setMessage('Please enter a note ID');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE}/notes/${noteId}/charts`);
      setSessions(response.data.sessions);
      setMessage(`Found ${response.data.sessions.length} chart sessions`);
    } catch (error) {
      setMessage('Error fetching sessions: ' + error.response?.data?.error || error.message);
    }
  };

  // Generate new chart
  const generateChart = async () => {
    if (!noteId || !chartRequest) {
      setMessage('Please enter both note ID and chart request');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/notes/generate-chart`, {
        noteId,
        chartRequest
      });

      if (response.data.success) {
        setCurrentChart(response.data.chart);
        setMessage('Chart generated successfully!');
        // Refresh sessions
        fetchChartSessions();
      } else {
        setMessage('Error generating chart: ' + response.data.error);
      }
    } catch (error) {
      setMessage('Error generating chart: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get specific chart
  const getChart = async (sessionId, chartId) => {
    try {
      const response = await axios.get(`${API_BASE}/notes/${noteId}/charts/${chartId}`);
      setCurrentChart(response.data.chart);
      setMessage('Chart fetched successfully');
    } catch (error) {
      setMessage('Error fetching chart: ' + error.response?.data?.error || error.message);
    }
  };

  // Update chart feedback
  const updateChartFeedback = async (chartId, feedbackValue) => {
    try {
      const response = await axios.put(`${API_BASE}/notes/chart-feedback`, {
        noteId,
        chartId,
        feedback: feedbackValue
      });

      setMessage('Feedback submitted: ' + feedbackValue);
      // Refresh current chart if it's the one we're viewing
      if (currentChart && currentChart._id === chartId) {
        setCurrentChart(prev => ({ ...prev, feedback: feedbackValue }));
      }
      // Refresh sessions
      fetchChartSessions();
    } catch (error) {
      setMessage('Error submitting feedback: ' + error.response?.data?.error || error.message);
    }
  };

  // Delete chart
  const deleteChart = async (chartId) => {
    try {
      await axios.delete(`${API_BASE}/notes/${noteId}/charts/${chartId}`);
      setMessage('Chart deleted successfully');
      setCurrentChart(null);
      // Refresh sessions
      fetchChartSessions();
    } catch (error) {
      setMessage('Error deleting chart: ' + error.response?.data?.error || error.message);
    }
  };

  // Clear session
  const clearSession = async () => {
    try {
      await axios.delete(`${API_BASE}/notes/${noteId}/charts`);
      setMessage('Session cleared successfully');
      setSessions([]);
      setCurrentChart(null);
      setSelectedSession(null);
    } catch (error) {
      setMessage('Error clearing session: ' + error.response?.data?.error || error.message);
    }
  };

  // Reset models
  const resetModels = async () => {
    try {
      await axios.post(`${API_BASE}/charts/reset-models`);
      setMessage('Models reset successfully');
      fetchModelStatus();
    } catch (error) {
      setMessage('Error resetting models: ' + error.response?.data?.error || error.message);
    }
  };

  // Reset token counter
  const resetTokenCounter = async () => {
    try {
      await axios.post(`${API_BASE}/charts/reset-tokens`);
      setMessage('Token counter reset successfully');
      fetchModelStatus();
    } catch (error) {
      setMessage('Error resetting token counter: ' + error.response?.data?.error || error.message);
    }
  };

  // Load mermaid and render chart
  useEffect(() => {
    if (currentChart && window.mermaid) {
      try {
        // Clear previous render
        const container = document.getElementById('mermaid-container');
        if (container) {
          container.innerHTML = currentChart.mermaidCode;
          
          // Initialize mermaid
          window.mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
          });
          
          // Render the chart
          window.mermaid.init(undefined, container);
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [currentChart]);

  // Load mermaid library
  useEffect(() => {
    const loadMermaid = () => {
      if (!window.mermaid) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
        script.onload = () => {
          window.mermaid.initialize({ startOnLoad: true });
        };
        document.head.appendChild(script);
      }
    };

    loadMermaid();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Chart Generation Tester</h1>
      
      {/* Status Message */}
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Model Status */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Model Status</h2>
            <button
              onClick={fetchModelStatus}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
              Fetch Model Status
            </button>
            
            {modelStatus && (
              <div className="text-sm">
                <p>Tokens Used: {modelStatus.totalTokensUsed}/{modelStatus.dailyLimit}</p>
                <p>Available Models: {modelStatus.availableModels?.length || 0}</p>
                <p>Models in Cooldown: {modelStatus.cooldownModels?.length || 0}</p>
              </div>
            )}
          </div>

          {/* Note ID Input */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Note Configuration</h2>
            <input
              type="text"
              value={noteId}
              onChange={(e) => setNoteId(e.target.value)}
              placeholder="Enter Note ID"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={fetchChartSessions}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Load Chart Sessions
            </button>
          </div>

          {/* Chart Generation */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Generate Chart</h2>
            <textarea
              value={chartRequest}
              onChange={(e) => setChartRequest(e.target.value)}
              placeholder="Enter chart request (e.g., 'Create a flowchart showing the process', 'Make a pie chart of topics')"
              className="w-full p-2 border border-gray-300 rounded mb-4 h-24"
            />
            <button
              onClick={generateChart}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300"
            >
              {loading ? 'Generating...' : 'Generate Chart'}
            </button>
          </div>

          {/* Utility Controls */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Utility Controls</h2>
            <div className="space-y-2">
              <button
                onClick={resetModels}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
              >
                Reset Models
              </button>
              <button
                onClick={resetTokenCounter}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
              >
                Reset Token Counter
              </button>
              <button
                onClick={clearSession}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
              >
                Clear Session
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Display */}
        <div className="space-y-6">
          {/* Current Chart Display */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Chart</h2>
            {currentChart ? (
              <div>
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <h3 className="font-semibold">{currentChart.description}</h3>
                  <p className="text-sm text-gray-600">
                    Type: {currentChart.type} | Model: {currentChart.modelUsed} | 
                    Complexity: {currentChart.complexity}
                  </p>
                  {currentChart.feedback && (
                    <p className="text-sm">Feedback: {currentChart.feedback}</p>
                  )}
                </div>

                {/* Mermaid Chart */}
                <div className="border rounded p-4 bg-white">
                  <div id="mermaid-container" className="mermaid">
                    {currentChart.mermaidCode}
                  </div>
                </div>

                {/* Chart Controls */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Feedback:</h4>
                  <div className="flex space-x-2">
                    {['useful', 'not_useful', 'needs_improvement'].map((fb) => (
                      <button
                        key={fb}
                        onClick={() => updateChartFeedback(currentChart._id, fb)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentChart.feedback === fb 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {fb.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => deleteChart(currentChart._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                  >
                    Delete This Chart
                  </button>
                </div>

                {/* Raw Mermaid Code */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">View Raw Mermaid Code</summary>
                  <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-auto max-h-40">
                    {currentChart.mermaidCode}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-gray-500">No chart selected. Generate a new chart or select one from sessions.</p>
            )}
          </div>

          {/* Chart Sessions */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Chart Sessions ({sessions.length})
            </h2>
            
            {sessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div key={session._id} className="border rounded p-3">
                    <h3 className="font-semibold">Session: {new Date(session.createdAt).toLocaleString()}</h3>
                    <p className="text-sm text-gray-600">Charts: {session.charts?.length || 0}</p>
                    
                    <div className="mt-2 space-y-2">
                      {session.charts?.map((chart) => (
                        <div
                          key={chart._id}
                          className={`p-2 rounded cursor-pointer border ${
                            currentChart?._id === chart._id 
                              ? 'bg-blue-100 border-blue-300' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => setCurrentChart(chart)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{chart.description}</p>
                              <p className="text-xs text-gray-500">
                                {chart.type} • {new Date(chart.timestamp).toLocaleTimeString()}
                                {chart.feedback && ` • ${chart.feedback}`}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChart(chart._id);
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No chart sessions found. Generate a chart to get started.</p>
            )}
          </div>
        </div>
      </div>

      {/* API Testing Section */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">API Route Testing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-100 rounded">
            <strong>GET</strong> /notes/:noteId/charts
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>GET</strong> /notes/:noteId/charts/:chartId
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>POST</strong> /notes/generate-chart
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>PUT</strong> /notes/chart-feedback
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>DELETE</strong> /notes/:noteId/charts/:chartId
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>DELETE</strong> /notes/:noteId/charts
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>POST</strong> /charts/reset-models
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <strong>GET</strong> /charts/status
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartGenerationTester;