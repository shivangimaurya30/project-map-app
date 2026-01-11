/**
 * Map Store - Zustand State Management
 * 
 * Central state management for the map drawing application.
 * Handles features, drawing mode, and shape limits.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { MapFeature, DrawingMode, ShapeType, ShapeCountsState } from '../types';
import { DEFAULT_SHAPE_LIMITS } from '../config/shapeConfig';
import { validateAndTrimFeature } from '../utils/geometry';
import { downloadGeoJSON, generateExportFilename } from '../utils/export';

interface MapState {
    /** All drawn features on the map */
    features: MapFeature[];
    /** Current drawing mode */
    drawingMode: DrawingMode;
    /** Shape limits configuration */
    shapeLimits: typeof DEFAULT_SHAPE_LIMITS;
    /** Error message for user feedback */
    errorMessage: string | null;
    /** Success message for user feedback */
    successMessage: string | null;
}

interface MapActions {
    /** Set the current drawing mode */
    setDrawingMode: (mode: DrawingMode) => void;
    /** Add a new feature with overlap validation */
    addFeature: (feature: Omit<MapFeature, 'properties'> & {
        properties: Omit<MapFeature['properties'], 'id' | 'createdAt'>
    }) => boolean;
    /** Remove a feature by ID */
    removeFeature: (id: string) => void;
    /** Update an existing feature */
    updateFeature: (id: string, updates: Partial<MapFeature>) => void;
    /** Clear all features */
    clearAllFeatures: () => void;
    /** Export all features as GeoJSON */
    exportGeoJSON: () => void;
    /** Get count of shapes by type */
    getShapeCounts: () => ShapeCountsState;
    /** Check if a shape type has reached its limit */
    isShapeLimitReached: (shapeType: ShapeType) => boolean;
    /** Clear error message */
    clearError: () => void;
    /** Clear success message */
    clearSuccess: () => void;
    /** Update shape limits */
    updateShapeLimits: (limits: Partial<typeof DEFAULT_SHAPE_LIMITS>) => void;
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
    // Initial state
    features: [],
    drawingMode: null,
    shapeLimits: { ...DEFAULT_SHAPE_LIMITS },
    errorMessage: null,
    successMessage: null,

    // Actions
    setDrawingMode: (mode) => {
        const state = get();

        // Check if limit is reached before enabling drawing mode
        if (mode && state.isShapeLimitReached(mode)) {
            set({
                errorMessage: `Maximum ${state.shapeLimits[mode]} ${mode}s reached`,
                drawingMode: null
            });
            return;
        }

        set({ drawingMode: mode, errorMessage: null });
    },

    addFeature: (featureData) => {
        const state = get();

        // Check shape limit
        if (state.isShapeLimitReached(featureData.properties.shapeType)) {
            set({
                errorMessage: `Maximum ${state.shapeLimits[featureData.properties.shapeType]} ${featureData.properties.shapeType}s reached`
            });
            return false;
        }

        // Create complete feature with ID and timestamp
        const newFeature: MapFeature = {
            type: 'Feature',
            geometry: featureData.geometry,
            properties: {
                ...featureData.properties,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
            },
        };

        // Validate overlap rules and auto-trim if needed
        const validationResult = validateAndTrimFeature(newFeature, state.features);

        if (!validationResult.isValid) {
            set({ errorMessage: validationResult.error || 'Invalid feature' });
            return false;
        }

        // Use trimmed feature if available
        const featureToAdd = validationResult.trimmedFeature || newFeature;

        set({
            features: [...state.features, featureToAdd],
            drawingMode: null,
            errorMessage: null,
            successMessage: validationResult.trimmedFeature
                ? 'Shape auto-trimmed to avoid overlap'
                : `${featureData.properties.shapeType} added successfully`,
        });

        return true;
    },

    removeFeature: (id) => {
        set((state) => ({
            features: state.features.filter(f => f.properties.id !== id),
            successMessage: 'Feature removed',
        }));
    },

    updateFeature: (id, updates) => {
        set((state) => ({
            features: state.features.map(f =>
                f.properties.id === id ? { ...f, ...updates } : f
            ),
        }));
    },

    clearAllFeatures: () => {
        set({
            features: [],
            successMessage: 'All features cleared'
        });
    },

    exportGeoJSON: () => {
        const { features } = get();
        if (features.length === 0) {
            set({ errorMessage: 'No features to export' });
            return;
        }

        const filename = generateExportFilename();
        downloadGeoJSON(features, filename);
        set({ successMessage: `Exported ${features.length} features` });
    },

    getShapeCounts: () => {
        const { features } = get();
        return {
            polygon: features.filter(f => f.properties.shapeType === 'polygon').length,
            rectangle: features.filter(f => f.properties.shapeType === 'rectangle').length,
            circle: features.filter(f => f.properties.shapeType === 'circle').length,
            linestring: features.filter(f => f.properties.shapeType === 'linestring').length,
        };
    },

    isShapeLimitReached: (shapeType) => {
        const counts = get().getShapeCounts();
        const limits = get().shapeLimits;
        return counts[shapeType] >= limits[shapeType];
    },

    clearError: () => set({ errorMessage: null }),

    clearSuccess: () => set({ successMessage: null }),

    updateShapeLimits: (limits) => {
        set((state) => ({
            shapeLimits: { ...state.shapeLimits, ...limits },
        }));
    },
}));
