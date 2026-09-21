'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze image');
      }

      // Maps the live backend JSON fields to your dashboard state
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-600">
            Global Visual Intelligence Hub
          </h1>
          <p className="text-gray-600">
            Snap or upload any physical item to uncover its history, material specs, and global marketplace prices.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
          {!previewUrl ? (
            <label className="w-full flex flex-col items-center px-4 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Drag & drop your item photo here, or <span className="text-blue-600">browse</span></span>
              <span className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP up to 10MB</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
            </label>
          ) : (
            <div className="space-y-4 w-full flex flex-col items-center">
              <img src={previewUrl} alt="Item Preview" className="h-64 object-contain rounded-xl border border-gray-200 shadow-sm" />
              <div className="flex gap-4">
                <button 
                  onClick={() => { setPreviewUrl(null); setSelectedFile(null); setResult(null); setError(null); }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Choose Another
                </button>
                <button 
                  onClick={handleScan}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Analyzing with Gemini AI...
                    </>
                  ) : 'Scan Globally'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ❌ Error: {error}
          </div>
        )}

        {/* Results Dashboard Section */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Product Overview & Timeline Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Match Confidence: {result.confidence}
                </span>
                <h2 className="text-2xl font-bold text-gray-800">{result.item_name}</h2>
                <p className="text-sm text-gray-600"><strong className="text-gray-800">Estimated Era:</strong> {result.era}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                  🛡️ {result.authenticity_notes}
                </div>
              </div>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-sm text-gray-700">Material Composition</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {result.materials?.map((mat, idx) => (
                    <li key={idx} className="flex items-center gap-2">✓ {mat}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Global Pricing Matrix Placeholder (Next step: adding SerpAPI web search) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Global Store & Marketplace Results</h3>
              <p className="text-xs text-gray-500">Live international web search and price aggregation are connecting next.</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}