import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, useProgress } from '@react-three/drei';
import GLBModel from '../components/GLBModel';
import WalkControls from '../components/WalkControls';
import OrbitViewControls from '../components/OrbitViewControls';
import HUD from '../components/HUD';
import ViewpointPanel from '../components/ViewpointPanel';
import UploadOverlay from '../components/UploadOverlay';
import './ViewerPage.css';
import config from '../config';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader">
        <div className="loader__bar" style={{ width: `${progress}%` }} />
        <p className="loader__text">{Math.round(progress)}% Loading model…</p>
      </div>
    </Html>
  );
}

export default function ViewerPage() {
  const { modelName } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('orbit'); // 'orbit' | 'walk'
  const [modelUrl, setModelUrl] = useState('');
  const [showViewpoints, setShowViewpoints] = useState(false);
  const [showUpload, setShowUpload] = useState(!modelName);
  const [teleportTarget, setTeleportTarget] = useState(null);

  useEffect(() => {
    if (modelName) {
      setModelUrl(config.modelsUrl(decodeURIComponent(modelName)));

      setShowUpload(false);
    }
  }, [modelName]);

  const handleModelLoaded = (url) => {
    setModelUrl(config.modelsUrl(decodeURIComponent(url )));

    setShowUpload(false);
  };

  return (
    <div className="viewer">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 5], fov: 75, near: 0.01, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0f' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.2}
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#c8f03c" />

        {modelUrl && (
          <Suspense fallback={<Loader />}>
            <GLBModel url={modelUrl} />
            <Environment preset="city" />
          </Suspense>
        )}

        {/* Controls */}
        {mode === 'orbit' && <OrbitViewControls />}
        {mode === 'walk' && <WalkControls teleportTarget={teleportTarget} onTeleportDone={() => setTeleportTarget(null)} />}
      </Canvas>

      {/* HUD overlay */}
      <HUD
        mode={mode}
        onModeChange={setMode}
        onBack={() => navigate('/')}
        onToggleViewpoints={() => setShowViewpoints((v) => !v)}
        modelName={modelName}
      />

      {/* Viewpoints panel */}
      {showViewpoints && (
        <ViewpointPanel
          onClose={() => setShowViewpoints(false)}
          onTeleport={(pos) => { setTeleportTarget(pos); setMode('walk'); }}
        />
      )}

      {/* Upload overlay (when no model) */}
      {showUpload && (
        <UploadOverlay onModelLoaded={handleModelLoaded} onClose={() => navigate('/')} />
      )}

      {/* Controls hint */}
      {mode === 'walk' && (
        <div className="controls-hint">
          <span>WASD — Move</span>
          <span>Mouse — Look (click canvas first)</span>
          <span>Space — Up · Shift — Down</span>
        </div>
      )}
      {mode === 'orbit' && (
        <div className="controls-hint">
          <span>Drag — Rotate</span>
          <span>Scroll — Zoom</span>
          <span>Right drag — Pan</span>
        </div>
      )}
    </div>
  );
}
