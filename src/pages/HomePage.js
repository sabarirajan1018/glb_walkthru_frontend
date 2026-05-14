import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

export default function HomePage() {
  const [models, setModels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await axios.get('/api/models');
      setModels(res.data.models);
    } catch {
      setError('Could not connect to server. Make sure the backend is running.');
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setError('Only .glb or .gltf files are allowed.');
      return;
    }
    setError('');
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('model', file);
    try {
      await axios.post('/api/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      await fetchModels();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/api/models/${name}`);
      setModels((prev) => prev.filter((m) => m.name !== name));
    } catch {
      setError('Delete failed.');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="home">
      <div className="home__bg" />
      <header className="home__header">
        <div className="home__logo">
          <span className="home__logo-icon">◈</span>
          <span>GLB Walker</span>
        </div>
        <p className="home__tagline">Upload a GLB model. Walk through it.</p>
      </header>

      <main className="home__main">
        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragOver ? 'upload-zone--over' : ''} ${uploading ? 'upload-zone--loading' : ''}`}
          onClick={() => !uploading && fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          {uploading ? (
            <div className="upload-zone__progress">
              <div className="upload-zone__bar" style={{ width: `${uploadProgress}%` }} />
              <span>{uploadProgress}% uploading…</span>
            </div>
          ) : (
            <>
              <div className="upload-zone__icon">⬆</div>
              <p className="upload-zone__label">Drop your <strong>.glb</strong> or <strong>.gltf</strong> file here</p>
              <p className="upload-zone__sub">or click to browse · max 500 MB</p>
            </>
          )}
        </div>

        {error && <div className="home__error">⚠ {error}</div>}

        {/* Model List */}
        {models.length > 0 && (
          <section className="models">
            <h2 className="models__heading">Uploaded Models</h2>
            <div className="models__grid">
              {models.map((m) => (
                <div
                  key={m.name}
                  className="model-card"
                  onClick={() => navigate(`/viewer/${encodeURIComponent(m.name)}`)}
                >
                  <div className="model-card__icon">◈</div>
                  <div className="model-card__info">
                    <p className="model-card__name">{m.name}</p>
                    <p className="model-card__size">{formatSize(m.size)}</p>
                  </div>
                  <div className="model-card__actions">
                    <button className="model-card__btn model-card__btn--open">Walk →</button>
                    <button
                      className="model-card__btn model-card__btn--del"
                      onClick={(e) => handleDelete(m.name, e)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {models.length === 0 && !uploading && !error && (
          <p className="home__empty">No models yet. Upload a .glb file to get started.</p>
        )}
      </main>
    </div>
  );
}
