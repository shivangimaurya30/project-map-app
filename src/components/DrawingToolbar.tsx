/**
 * Drawing Toolbar Component
 * 
 * Left sidebar with drawing tools and shape controls.
 * Shows current shape counts and limits for each type.
 */

import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import type { ShapeType } from '../types';
import './DrawingToolbar.css';

/** Shape button configuration */
const SHAPE_BUTTONS: { type: ShapeType; icon: string; label: string }[] = [
  { type: 'polygon', icon: '⬡', label: 'Polygon' },
  { type: 'rectangle', icon: '▭', label: 'Rectangle' },
  { type: 'circle', icon: '◯', label: 'Circle' },
  { type: 'linestring', icon: '╱', label: 'Line' },
];

export function DrawingToolbar() {
  const {
    drawingMode,
    setDrawingMode,
    shapeLimits,
    getShapeCounts,
    isShapeLimitReached,
    exportGeoJSON,
    clearAllFeatures,
    features,
    errorMessage,
    successMessage,
    clearError,
    clearSuccess,
  } = useMapStore();

  const shapeCounts = getShapeCounts();

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(clearSuccess, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  const handleShapeClick = (shapeType: ShapeType) => {
    if (drawingMode === shapeType) {
      setDrawingMode(null); // Toggle off
    } else {
      setDrawingMode(shapeType);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-header">
        <h1 className="toolbar-title">Map Draw</h1>
        <p className="toolbar-subtitle">Draw & manage shapes</p>
      </div>

      {/* Drawing Tools */}
      <div className="toolbar-section">
        <h2 className="section-title">Drawing Tools</h2>
        <div className="shape-buttons">
          {SHAPE_BUTTONS.map(({ type, icon, label }) => {
            const count = shapeCounts[type];
            const limit = shapeLimits[type];
            const isLimitReached = isShapeLimitReached(type);
            const isActive = drawingMode === type;

            return (
              <button
                key={type}
                className={`shape-button ${isActive ? 'active' : ''} ${isLimitReached ? 'disabled' : ''}`}
                onClick={() => handleShapeClick(type)}
                disabled={isLimitReached}
                title={isLimitReached ? `Maximum ${limit} ${label}s reached` : `Draw ${label}`}
              >
                <span className="shape-icon">{icon}</span>
                <span className="shape-label">{label}</span>
                <span className="shape-count">
                  {count}/{limit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Drawing Mode Indicator */}
      {drawingMode && (
        <div className="drawing-mode-indicator">
          <span className="mode-dot" />
          Drawing: <strong>{drawingMode}</strong>
          <button className="cancel-btn" onClick={() => setDrawingMode(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="message error-message">
          <span className="message-icon">⚠</span>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="message success-message">
          <span className="message-icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Statistics */}
      <div className="toolbar-section">
        <h2 className="section-title">Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{features.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{shapeCounts.polygon + shapeCounts.rectangle + shapeCounts.circle}</span>
            <span className="stat-label">Polygons</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{shapeCounts.linestring}</span>
            <span className="stat-label">Lines</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="toolbar-section toolbar-actions">
        <button
          className="action-button export-btn"
          onClick={exportGeoJSON}
          disabled={features.length === 0}
          title="Export all shapes as GeoJSON"
        >
          <span className="action-icon">📥</span>
          Export GeoJSON
        </button>
        <button
          className="action-button clear-btn"
          onClick={clearAllFeatures}
          disabled={features.length === 0}
          title="Clear all shapes"
        >
          <span className="action-icon">🗑</span>
          Clear All
        </button>
      </div>

      {/* Help */}
      <div className="toolbar-footer">
        <p className="help-text">
          <strong>Tip:</strong> Click on a tool, then click on the map to start drawing.
          Polygons will auto-trim if overlapping.
        </p>
      </div>
    </div>
  );
}
