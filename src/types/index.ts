/**
 * TypeScript type definitions for the Map Drawing Application
 */

import type { Feature as GeoJSONFeature, Geometry, Position } from 'geojson';

/** Available shape types that can be drawn on the map */
export type ShapeType = 'polygon' | 'rectangle' | 'circle' | 'linestring';

/** Shape types that are subject to overlap rules (polygonal features) */
export type PolygonalShapeType = 'polygon' | 'rectangle' | 'circle';

/** Properties attached to each drawn feature */
export interface FeatureProperties {
  id: string;
  shapeType: ShapeType;
  createdAt: string;
  name?: string;
  /** For circles: radius in meters */
  radius?: number;
  /** For circles: center coordinates [lng, lat] */
  center?: Position;
}

/** Extended GeoJSON Feature with our custom properties */
export interface MapFeature extends GeoJSONFeature<Geometry, FeatureProperties> {
  properties: FeatureProperties;
}

/** Configuration for maximum allowed shapes per type */
export interface ShapeLimitsConfig {
  polygon: number;
  rectangle: number;
  circle: number;
  linestring: number;
}

/** Current count of shapes by type */
export interface ShapeCountsState {
  polygon: number;
  rectangle: number;
  circle: number;
  linestring: number;
}

/** Result of overlap validation */
export interface OverlapValidationResult {
  isValid: boolean;
  error?: string;
  trimmedFeature?: MapFeature;
}

/** Drawing mode for the toolbar */
export type DrawingMode = ShapeType | null;
