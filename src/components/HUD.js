import React from 'react';
import './HUD.css';

export default function HUD({ mode, onModeChange, onBack, onToggleViewpoints, modelName }) {
  return (
    <div className="hud">
      {/* Top bar */}
      <div className="hud__top">
        <button className="hud__back" onClick={onBack}>
          ← Back
        </button>
        <div className="hud__title">
          <span className="hud__logo">◈</span>
          {modelName ? decodeURIComponent(modelName) : 'GLB Viewer'}
        </div>
        <button className="hud__viewpoints" onClick={onToggleViewpoints}>
          ⊹ Viewpoints
        </button>
      </div>

      {/* Mode switcher */}
      <div className="hud__modes">
        <button
          className={`hud__mode ${mode === 'orbit' ? 'hud__mode--active' : ''}`}
          onClick={() => onModeChange('orbit')}
          title="Orbit around the model"
        >
          <span className="hud__mode-icon">⊚</span>
          Orbit
        </button>
        <button
          className={`hud__mode ${mode === 'walk' ? 'hud__mode--active' : ''}`}
          onClick={() => onModeChange('walk')}
          title="First-person walkthrough (click canvas to lock mouse)"
        >
          <span className="hud__mode-icon">⇝</span>
          Walk
        </button>
      </div>

      {mode === 'walk' && (
        <div className="hud__walk-tip">Click the canvas to lock mouse for look-around</div>
      )}
    </div>
  );
}
