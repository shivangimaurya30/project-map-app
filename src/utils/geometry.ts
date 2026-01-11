/**
 * Geometry Utilities
 * 
 * Handles spatial operations for overlap detection and polygon trimming
 * using Turf.js library. This module is critical for enforcing the
 * non-overlapping polygon constraint.
 */

import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon, Position, GeoJsonProperties } from 'geojson';
import type { MapFeature, OverlapValidationResult, ShapeType } from '../types';

/**
 * Converts a circle feature to a polygon approximation for overlap checks
 * Turf.js circles are represented as 64-sided polygons
 */
export function circleToPolygon(
    center: Position,
    radiusMeters: number,
    steps: number = 64
): Feature<Polygon> {
    return turf.circle(center, radiusMeters / 1000, { steps, units: 'kilometers' });
}

/**
 * Gets a Turf-compatible polygon from a MapFeature
 * Handles circle conversion automatically
 */
export function getFeatureAsPolygon(feature: MapFeature): Feature<Polygon | MultiPolygon> | null {
    const { shapeType } = feature.properties;

    // Line strings are excluded from overlap checks
    if (shapeType === 'linestring') {
        return null;
    }

    // Convert circles to polygon approximation
    if (shapeType === 'circle' && feature.properties.center && feature.properties.radius) {
        return circleToPolygon(feature.properties.center, feature.properties.radius);
    }

    // Polygons and rectangles are already polygon geometries
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        return feature as Feature<Polygon | MultiPolygon>;
    }

    return null;
}

/**
 * Checks if two polygonal features overlap
 * Returns true if there is any intersection between the features
 */
export function checkFeaturesOverlap(
    feature1: Feature<Polygon | MultiPolygon>,
    feature2: Feature<Polygon | MultiPolygon>
): boolean {
    try {
        const intersection = turf.intersect(
            turf.featureCollection([feature1, feature2])
        );
        return intersection !== null;
    } catch {
        // If intersection fails, assume no overlap for safety
        return false;
    }
}

/**
 * Checks if the inner polygon is fully enclosed by the outer polygon
 * Used to detect and block features that would completely contain another
 */
export function isFullyEnclosed(
    innerFeature: Feature<Polygon | MultiPolygon>,
    outerFeature: Feature<Polygon | MultiPolygon>
): boolean {
    try {
        return turf.booleanContains(outerFeature, innerFeature);
    } catch {
        return false;
    }
}

/**
 * Trims a new polygon to remove overlapping areas with existing polygons
 * Uses turf.difference to subtract overlapping regions
 * 
 * @param newPolygon - The polygon being added
 * @param existingPolygon - An existing polygon to subtract from the new one
 * @returns The trimmed polygon, or null if nothing remains
 */
export function trimPolygon(
    newPolygon: Feature<Polygon | MultiPolygon>,
    existingPolygon: Feature<Polygon | MultiPolygon>
): Feature<Polygon | MultiPolygon, GeoJsonProperties> | null {
    try {
        // Subtract the existing polygon from the new one
        const result = turf.difference(
            turf.featureCollection([newPolygon, existingPolygon])
        );
        return result;
    } catch {
        return null;
    }
}

/**
 * Validates a new feature against existing features for overlap rules
 * 
 * Rules:
 * 1. Line strings are always valid (excluded from overlap rules)
 * 2. If new polygon fully encloses any existing polygon → BLOCK
 * 3. If any existing polygon fully encloses new polygon → BLOCK
 * 4. If overlap exists → AUTO-TRIM the new polygon
 * 
 * @param newFeature - The feature being added
 * @param existingFeatures - Array of existing features on the map
 * @returns Validation result with trimmed feature if applicable
 */
export function validateAndTrimFeature(
    newFeature: MapFeature,
    existingFeatures: MapFeature[]
): OverlapValidationResult {
    // Line strings are excluded from overlap rules
    if (newFeature.properties.shapeType === 'linestring') {
        return { isValid: true };
    }

    const newPolygon = getFeatureAsPolygon(newFeature);
    if (!newPolygon) {
        return { isValid: true };
    }

    // Get all existing polygonal features
    const existingPolygons = existingFeatures
        .filter(f => f.properties.shapeType !== 'linestring')
        .map(f => ({ feature: f, polygon: getFeatureAsPolygon(f) }))
        .filter((item): item is { feature: MapFeature; polygon: Feature<Polygon | MultiPolygon> } =>
            item.polygon !== null
        );

    let currentPolygon = newPolygon;

    for (const { polygon: existingPolygon } of existingPolygons) {
        // Check if features overlap
        if (!checkFeaturesOverlap(currentPolygon, existingPolygon)) {
            continue;
        }

        // Check for full enclosure - new polygon encloses existing
        if (isFullyEnclosed(existingPolygon, currentPolygon)) {
            return {
                isValid: false,
                error: 'Cannot create a shape that fully encloses an existing shape',
            };
        }

        // Check for full enclosure - existing polygon encloses new
        if (isFullyEnclosed(currentPolygon, existingPolygon)) {
            return {
                isValid: false,
                error: 'Cannot create a shape that is fully enclosed by an existing shape',
            };
        }

        // Auto-trim the polygon to remove overlap
        const trimmedPolygon = trimPolygon(currentPolygon, existingPolygon);
        if (!trimmedPolygon) {
            return {
                isValid: false,
                error: 'Shape would be completely consumed by overlap trimming',
            };
        }

        currentPolygon = trimmedPolygon;
    }

    // If trimming occurred, create a new feature with the trimmed geometry
    if (currentPolygon !== newPolygon) {
        const trimmedFeature: MapFeature = {
            ...newFeature,
            geometry: currentPolygon.geometry,
        };
        return {
            isValid: true,
            trimmedFeature,
        };
    }

    return { isValid: true };
}

/**
 * Calculates the area of a polygon in square meters
 */
export function calculateArea(feature: MapFeature): number {
    const polygon = getFeatureAsPolygon(feature);
    if (!polygon) return 0;
    return turf.area(polygon);
}

/**
 * Gets the shape type from a feature - helper for type guards
 */
export function isPolygonalShape(shapeType: ShapeType): boolean {
    return shapeType === 'polygon' || shapeType === 'rectangle' || shapeType === 'circle';
}
