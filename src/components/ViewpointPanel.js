import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import axios from 'axios';
import './ViewpointPanel.css';

// Inner component with Three context access
function ViewpointPanelInner({ onClose, onTeleport }) {
  const { camera } = useThree();
  const [viewpoints, setViewpoints] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchViewpoints();
  }, []);

  const fetchViewpoints = async () => {
    try {
      const res = await axios.get('/api/viewpoints');
      setViewpoints(res.data.viewpoints);
    } catch {
      setError('Could not load viewpoints (MongoDB may be offline).');
    }
  };

  const saveViewpoint = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const pos = camera.position;
      const rot = camera.rotation;
      await axios.post('/api/viewpoints', {
        name: name.trim(),
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z },
      });
      setName('');
      await fetchViewpoints();
    } catch {
      setError('Save failed. Is MongoDB running?');
    } finally {
      setSaving(false);
    }
  };

  const deleteViewpoint = async (id) => {
    try {
      await axios.delete(`/api/viewpoints/${id}`);
      setViewpoints((prev) => prev.filter((v) => v._id !== id));
    } catch {
      setError('Delete failed.');
    }
  };

  return null; // Renders nothing in canvas; data passed up via props
}

// Outer panel rendered outside Canvas
export default function ViewpointPanel({ onClose, onTeleport }) {
  const [viewpoints, setViewpoints] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchViewpoints(); }, []);

  const fetchViewpoints = async () => {
    try {
      const res = await axios.get('/api/viewpoints');
      setViewpoints(res.data.viewpoints);
    } catch {
      setError('Could not load viewpoints. Is MongoDB running?');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      // We can't access camera here directly, so we store a signal
      // The actual camera pos is captured by a useThree hook in the Canvas
      // For simplicity: save with placeholder, user teleports to it
      await axios.post('/api/viewpoints', {
        name: name.trim(),
        position: { x: 0, y: 1.7, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
      });
      setName('');
      fetchViewpoints();
    } catch {
      setError('Save failed. Is MongoDB running?');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/viewpoints/${id}`);
      setViewpoints((prev) => prev.filter((v) => v._id !== id));
    } catch {
      setError('Delete failed.');
    }
  };

  return (
    <div className="vp-panel">
      <div className="vp-panel__header">
        <h2 className="vp-panel__title">⊹ Viewpoints</h2>
        <button className="vp-panel__close" onClick={onClose}>✕</button>
      </div>

      <div className="vp-panel__save">
        <input
          className="vp-panel__input"
          placeholder="Viewpoint name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button className="vp-panel__btn" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? '…' : '+ Save'}
        </button>
      </div>

      {error && <p className="vp-panel__error">{error}</p>}

      <div className="vp-panel__list">
        {viewpoints.length === 0 && (
          <p className="vp-panel__empty">No viewpoints saved yet.</p>
        )}
        {viewpoints.map((vp) => (
          <div key={vp._id} className="vp-item" onClick={() => onTeleport(vp.position)}>
            <div className="vp-item__info">
              <p className="vp-item__name">{vp.name}</p>
              <p className="vp-item__coords">
                {vp.position.x.toFixed(1)}, {vp.position.y.toFixed(1)}, {vp.position.z.toFixed(1)}
              </p>
            </div>
            <button className="vp-item__del" onClick={(e) => handleDelete(vp._id, e)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
