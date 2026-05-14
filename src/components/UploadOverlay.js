import React, { useState, useRef } from 'react';
import axios from 'axios';
import './UploadOverlay.css';

export default function UploadOverlay({ onModelLoaded, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file || !/\.(glb|gltf)$/i.test(file.name)) {
      setError('Only .glb or .gltf files are supported.');
      return;
    }
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('model', file);
    try {
      const res = await axios.post('/api/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onModelLoaded(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-overlay">
      <div
        className={`upload-overlay__box ${dragOver ? 'upload-overlay__box--over' : ''}`}
        onClick={() => !uploading && fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <input ref={fileRef} type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        {uploading ? (
          <div className="upload-overlay__progress">
            <div className="upload-overlay__bar" style={{ width: `${progress}%` }} />
            <p>{progress}% uploading…</p>
          </div>
        ) : (
          <>
            <div className="upload-overlay__icon">◈</div>
            <p className="upload-overlay__label">Drop a <strong>.glb</strong> model here</p>
            <p className="upload-overlay__sub">or click to browse</p>
          </>
        )}
        {error && <p className="upload-overlay__error">⚠ {error}</p>}
      </div>
      <button className="upload-overlay__cancel" onClick={onClose}>Cancel</button>
    </div>
  );
}
