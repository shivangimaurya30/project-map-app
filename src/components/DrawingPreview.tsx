/**
 * Drawing Preview Component
 * 
 * Shows real-time preview of the shape being drawn
 * (partial polygon, circle radius line, etc.)
 */

import { useState, useEffect } from 'react';
import { Polyline, Circle, Rectangle, useMapEvents } from 'react-leaflet';
import { useMapStore } from '../store/mapStore';
import type { LatLng, LatLngBounds } from 'leaflet';
import L from 'leaflet';

const PREVIEW_STYLE = {
  color: '#8B5CF6',
  weight: 2,
  dashArray: '5, 5',
  fillOpacity: 0.2,
};

export function DrawingPreview() {
  const { drawingMode } = useMapStore();
  const [points, setPoints] = useState<LatLng[]>([]);
  const [mousePosition, setMousePosition] = useState<LatLng | null>(null);
  const [firstClick, setFirstClick] = useState<LatLng | null>(null);

  // Reset when drawing mode changes
  useEffect(() => {
    setPoints([]);
    setFirstClick(null);
    setMousePosition(null);
  }, [drawingMode]);

  useMapEvents({
    mousemove: (e) => {
      if (drawingMode) {
        setMousePosition(e.latlng);
      }
    },
    click: (e) => {
      if (!drawingMode) return;

      if (drawingMode === 'polygon' || drawingMode === 'linestring') {
        setPoints(prev => [...prev, e.latlng]);
      } else if (drawingMode === 'circle' || drawingMode === 'rectangle') {
        if (!firstClick) {
          setFirstClick(e.latlng);
        } else {
          setFirstClick(null);
        }
      }
    },
    dblclick: () => {
      if (drawingMode === 'polygon' || drawingMode === 'linestring') {
        setPoints([]);
      }
    },
  });

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPoints([]);
        setFirstClick(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!drawingMode || !mousePosition) return null;

  // Preview for polygon/linestring
  if ((drawingMode === 'polygon' || drawingMode === 'linestring') && points.length > 0) {
    const previewPoints = [...points, mousePosition];
    return (
      <Polyline
        positions={previewPoints}
        pathOptions={PREVIEW_STYLE}
      />
    );
  }

  // Preview for circle
  if (drawingMode === 'circle' && firstClick) {
    const radius = firstClick.distanceTo(mousePosition);
    return (
      <>
        <Circle
          center={firstClick}
          radius={radius}
          pathOptions={PREVIEW_STYLE}
        />
        <Polyline
          positions={[firstClick, mousePosition]}
          pathOptions={{ ...PREVIEW_STYLE, dashArray: '2, 4' }}
        />
      </>
    );
  }

  // Preview for rectangle
  if (drawingMode === 'rectangle' && firstClick) {
    const bounds: LatLngBounds = L.latLngBounds(firstClick, mousePosition);
    return (
      <Rectangle
        bounds={bounds}
        pathOptions={PREVIEW_STYLE}
      />
    );
  }

  return null;
}
