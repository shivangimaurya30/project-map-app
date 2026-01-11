/**
 * Map View Component
 * 
 * Main map container that renders OpenStreetMap tiles and all layers.
 */

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { FeatureLayer } from './FeatureLayer';
import { DrawingEventHandler } from '../hooks/useDrawingHandler';
import { DrawingPreview } from './DrawingPreview';
import { MAP_CONFIG } from '../config/shapeConfig';
import { useMapStore } from '../store/mapStore';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

export function MapView() {
  const { drawingMode } = useMapStore();
  
  return (
    <div className={`map-wrapper ${drawingMode ? 'is-drawing' : ''}`}>
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        zoomControl={false}
        doubleClickZoom={false}
        className="map-container"
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zoom Controls */}
        <ZoomControl position="topright" />

        {/* Rendered Features */}
        <FeatureLayer />

        {/* Drawing Event Handler */}
        <DrawingEventHandler />

        {/* Drawing Preview */}
        <DrawingPreview />
      </MapContainer>

      {/* Drawing Instructions Overlay */}
      <DrawingInstructions />
    </div>
  );
}

interface InstructionData {
  title: string;
  icon: string;
  steps: string[];
  color: string;
}

/**
 * Floating instructions panel based on current drawing mode
 * Shows large, prominent step-by-step guidance
 */
function DrawingInstructions() {
  const { drawingMode, setDrawingMode } = useMapStore();

  if (!drawingMode) return null;

  const instructionData: Record<string, InstructionData> = {
    polygon: {
      title: 'Drawing Polygon',
      icon: '⬡',
      color: '#8B5CF6',
      steps: [
        '👆 Click on the map to add each corner point',
        '📍 Keep clicking to add more points',
        '✅ Double-click to complete the polygon',
      ],
    },
    rectangle: {
      title: 'Drawing Rectangle',
      icon: '▭',
      color: '#06B6D4',
      steps: [
        '👆 Click on the map to set the first corner',
        '📍 Move to the opposite corner position',
        '✅ Click again to complete the rectangle',
      ],
    },
    circle: {
      title: 'Drawing Circle',
      icon: '◯',
      color: '#F59E0B',
      steps: [
        '👆 Click on the map to set the center point',
        '📍 Move outward to set the radius size',
        '✅ Click again to complete the circle',
      ],
    },
    linestring: {
      title: 'Drawing Line',
      icon: '╱',
      color: '#10B981',
      steps: [
        '👆 Click on the map to start the line',
        '📍 Keep clicking to add more points',
        '✅ Double-click to complete the line',
      ],
    },
  };

  const data = instructionData[drawingMode];

  return (
    <div className="drawing-overlay">
      <div className="drawing-instruction-card" style={{ borderColor: data.color }}>
        <div className="instruction-header" style={{ background: `${data.color}20` }}>
          <span className="instruction-shape-icon" style={{ color: data.color }}>{data.icon}</span>
          <h2 className="instruction-title">{data.title}</h2>
        </div>
        
        <div className="instruction-steps">
          {data.steps.map((step, index) => (
            <div key={index} className="instruction-step">
              <span className="step-number" style={{ background: data.color }}>{index + 1}</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>

        <div className="instruction-footer">
          <button 
            className="cancel-drawing-btn"
            onClick={() => setDrawingMode(null)}
          >
            ✕ Cancel (ESC)
          </button>
          <span className="click-map-hint">👆 Click on the map to start</span>
        </div>
      </div>
    </div>
  );
}


