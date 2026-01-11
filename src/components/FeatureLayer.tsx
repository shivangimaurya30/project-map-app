/**
 * Feature Layer Component
 * 
 * Renders all drawn features on the map with appropriate styling.
 * Uses React-Leaflet components for rendering.
 */

import { Polygon, Polyline, Circle, Popup } from 'react-leaflet';
import { useMapStore } from '../store/mapStore';
import { FEATURE_STYLES } from '../config/shapeConfig';
import type { MapFeature } from '../types';
import type { LatLngExpression } from 'leaflet';

/**
 * Converts GeoJSON coordinates to Leaflet LatLng format
 * GeoJSON uses [longitude, latitude], Leaflet uses [latitude, longitude]
 */
function geoJSONToLatLng(coords: number[]): LatLngExpression {
  return [coords[1], coords[0]] as LatLngExpression;
}

/**
 * Converts polygon coordinates from GeoJSON to Leaflet format
 */
function convertPolygonCoords(coordinates: number[][][]): LatLngExpression[][] {
  return coordinates.map(ring => ring.map(geoJSONToLatLng));
}

/**
 * Renders a single feature based on its type
 */
function FeatureRenderer({ feature }: { feature: MapFeature }) {
  const { removeFeature } = useMapStore();
  const { shapeType, id, createdAt } = feature.properties;
  const geometry = feature.geometry;

  const popupContent = (
    <div className="feature-popup">
      <strong>{shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}</strong>
      <br />
      <small>Created: {new Date(createdAt).toLocaleString()}</small>
      <br />
      <button
        onClick={() => removeFeature(id)}
        style={{
          marginTop: '8px',
          padding: '4px 12px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Delete
      </button>
    </div>
  );

  // Circle rendering
  if (shapeType === 'circle' && feature.properties.center && feature.properties.radius) {
    const center = feature.properties.center;
    const style = FEATURE_STYLES.circle;
    return (
      <Circle
        center={[center[1], center[0]]}
        radius={feature.properties.radius}
        pathOptions={{
          color: style.color,
          fillColor: style.fillColor,
          fillOpacity: style.fillOpacity,
          weight: style.weight,
        }}
      >
        <Popup>{popupContent}</Popup>
      </Circle>
    );
  }

  // Line string rendering
  if (shapeType === 'linestring' && geometry.type === 'LineString') {
    const positions = geometry.coordinates.map(geoJSONToLatLng);
    const style = FEATURE_STYLES.linestring;
    return (
      <Polyline
        positions={positions}
        pathOptions={{
          color: style.color,
          weight: style.weight,
          dashArray: style.dashArray,
        }}
      >
        <Popup>{popupContent}</Popup>
      </Polyline>
    );
  }

  // Polygon/Rectangle rendering
  if ((shapeType === 'polygon' || shapeType === 'rectangle') && geometry.type === 'Polygon') {
    const positions = convertPolygonCoords(geometry.coordinates);
    const style = shapeType === 'rectangle' ? FEATURE_STYLES.rectangle : FEATURE_STYLES.polygon;
    return (
      <Polygon
        positions={positions}
        pathOptions={{
          color: style.color,
          fillColor: style.fillColor,
          fillOpacity: style.fillOpacity,
          weight: style.weight,
        }}
      >
        <Popup>{popupContent}</Popup>
      </Polygon>
    );
  }

  // MultiPolygon rendering (can result from auto-trimming)
  if (geometry.type === 'MultiPolygon') {
    const style = FEATURE_STYLES.polygon;
    return (
      <>
        {geometry.coordinates.map((polygonCoords, index) => {
          const positions = convertPolygonCoords(polygonCoords);
          return (
            <Polygon
              key={`${id}-${index}`}
              positions={positions}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
                weight: style.weight,
              }}
            >
              <Popup>{popupContent}</Popup>
            </Polygon>
          );
        })}
      </>
    );
  }

  return null;
}

/**
 * Renders all features from the store
 */
export function FeatureLayer() {
  const { features } = useMapStore();

  return (
    <>
      {features.map(feature => (
        <FeatureRenderer key={feature.properties.id} feature={feature} />
      ))}
    </>
  );
}
