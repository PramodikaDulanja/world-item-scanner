'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (files.length > 5) {
        setError("You can upload a maximum of 5 images.");
        return;
      }
      setSelectedFiles(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file); // Matches FastAPI List[UploadFile] parameter name 'files'
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze images');
      }

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
            Upload up to 5 photos of your item (different angles, labels, details) for precise AI identification.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
          {previewUrls.length === 0 ? (
            <label className="w-full flex flex-col items-center px-4 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Drag & drop up to 5 item photos here, or <span className="text-blue-600">browse</span></span>
              <span className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP (Max 5 images)</span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </label>
          ) : (
            <div className="space-y-4 w-full flex flex-col items-center">
              {/* Image Previews Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                {previewUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Preview ${idx + 1}`} className="h-28 w-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => { setPreviewUrls([]); setSelectedFiles([]); setResult(null); setError(null); }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Reset Photos
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
                      Analyzing All Angles...
                    </>
                  ) : `Scan ${selectedFiles.length} Photos Globally`}
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

{/* Global E-Commerce Marketplace Cards Grid */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-bold text-gray-800">Global Marketplace Listings</h3>
    <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
      Live Web Results
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {result.global_prices?.map((item, idx) => (
      <a 
        key={idx} 
        href={item.link} 
        target="_blank" 
        rel="noreferrer" 
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
      >
        <div className="space-y-3">
          {/* Product Thumbnail */}
          <div className="h-32 w-full bg-white rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
            <img 
              src={item.thumbnail || "https://via.placeholder.com/150"} 
              alt={item.store} 
              className="h-full w-full object-contain p-2 group-hover:scale-105 transition" 
            />
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.store}</span>
            <h4 className="text-base font-bold text-gray-900 mt-1">{item.price}</h4>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-gray-200 flex items-center justify-between text-xs text-blue-600 font-medium">
          <span>Visit Store</span>
          <span className="group-hover:translate-x-0.5 transition">↗</span>
        </div>
      </a>
    ))}
  </div>
</div>


          </div>
        )}

      </div>
    </main>
  );
}