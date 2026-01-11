/**
 * Shape Limits Configuration
 * 
 * Adjust these values to change the maximum number of each shape type
 * that can be drawn on the map. These limits are easily adjustable
 * and not hardcoded throughout the application.
 */

import type { ShapeLimitsConfig } from '../types';

/** 
 * Default shape limits - modify these values to change constraints
 * All limits can be adjusted here in one place
 */
export const DEFAULT_SHAPE_LIMITS: ShapeLimitsConfig = {
    polygon: 10,     // Maximum freeform polygons
    rectangle: 10,   // Maximum rectangles
    circle: 5,       // Maximum circles
    linestring: 20,  // Maximum line strings
};

/** 
 * Map styling configuration
 */
export const MAP_CONFIG = {
    /** Default map center [latitude, longitude] */
    defaultCenter: [20.5937, 78.9629] as [number, number], // India center
    /** Default zoom level */
    defaultZoom: 5,
    /** Minimum zoom level */
    minZoom: 2,
    /** Maximum zoom level */
    maxZoom: 18,
};

/**
 * Feature styling configuration
 */
export const FEATURE_STYLES = {
    polygon: {
        color: '#8B5CF6',      // Purple
        fillColor: '#8B5CF6',
        fillOpacity: 0.3,
        weight: 2,
    },
    rectangle: {
        color: '#06B6D4',      // Cyan
        fillColor: '#06B6D4',
        fillOpacity: 0.3,
        weight: 2,
    },
    circle: {
        color: '#F59E0B',      // Amber
        fillColor: '#F59E0B',
        fillOpacity: 0.3,
        weight: 2,
    },
    linestring: {
        color: '#10B981',      // Emerald
        weight: 3,
        dashArray: '5, 10',
    },
    hover: {
        fillOpacity: 0.5,
        weight: 3,
    },
    error: {
        color: '#EF4444',      // Red
        fillColor: '#EF4444',
        fillOpacity: 0.5,
    },
};
