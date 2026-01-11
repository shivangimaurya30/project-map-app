/**
 * Export Utilities
 * 
 * Handles conversion of features to GeoJSON format and file download
 */

import type { FeatureCollection } from 'geojson';
import type { MapFeature } from '../types';

/**
 * Converts all map features to a GeoJSON FeatureCollection
 */
export function createGeoJSONExport(features: MapFeature[]): FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: features.map(feature => ({
            type: 'Feature',
            geometry: feature.geometry,
            properties: {
                id: feature.properties.id,
                shapeType: feature.properties.shapeType,
                createdAt: feature.properties.createdAt,
                name: feature.properties.name,
                // Include circle-specific properties if applicable
                ...(feature.properties.radius && { radius: feature.properties.radius }),
                ...(feature.properties.center && { center: feature.properties.center }),
            },
        })),
    };
}

/**
 * Triggers a download of the GeoJSON file
 */
export function downloadGeoJSON(features: MapFeature[], filename: string = 'features.geojson'): void {
    const geojson = createGeoJSONExport(features);
    const jsonString = JSON.stringify(geojson, null, 2);

    const blob = new Blob([jsonString], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Generates a timestamp-based filename for exports
 */
export function generateExportFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `map-features-${timestamp}.geojson`;
}
