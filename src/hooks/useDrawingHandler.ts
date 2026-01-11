/**
 * useDrawingHandler Hook
 * 
 * Custom hook that handles map click events for drawing shapes.
 * Manages the drawing state and creates features based on the current mode.
 */

import { useState, useCallback, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useMapStore } from '../store/mapStore';

import type { LatLng, LeafletMouseEvent } from 'leaflet';

interface DrawingState {
    /** Points collected for polygon/linestring drawing */
    points: LatLng[];
    /** Center point for circle (first click) */
    circleCenter: LatLng | null;
    /** First corner for rectangle */
    rectStart: LatLng | null;
}

/**
 * Hook to handle drawing interactions on the map
 */
export function useDrawingHandler() {
    const { drawingMode, addFeature, setDrawingMode } = useMapStore();

    const [drawingState, setDrawingState] = useState<DrawingState>({
        points: [],
        circleCenter: null,
        rectStart: null,
    });

    // Reset drawing state when mode changes
    useEffect(() => {
        setDrawingState({
            points: [],
            circleCenter: null,
            rectStart: null,
        });
    }, [drawingMode]);

    /**
     * Creates a polygon feature from collected points
     */
    const createPolygon = useCallback((points: LatLng[], shapeType: 'polygon' | 'rectangle') => {
        if (points.length < 3) return;

        // Close the polygon by repeating the first point
        const coordinates = [
            ...points.map(p => [p.lng, p.lat]),
            [points[0].lng, points[0].lat]
        ];

        addFeature({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
            properties: {
                shapeType,
            },
        });
    }, [addFeature]);

    /**
     * Creates a rectangle feature from two corner points
     */
    const createRectangle = useCallback((start: LatLng, end: LatLng) => {
        const coordinates = [[
            [start.lng, start.lat],
            [end.lng, start.lat],
            [end.lng, end.lat],
            [start.lng, end.lat],
            [start.lng, start.lat],
        ]];

        addFeature({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates,
            },
            properties: {
                shapeType: 'rectangle',
            },
        });
    }, [addFeature]);

    /**
     * Creates a circle feature from center and radius
     */
    const createCircle = useCallback((center: LatLng, radiusPoint: LatLng) => {
        // Calculate radius in meters using Haversine formula approximation
        const R = 6371000; // Earth radius in meters
        const dLat = (radiusPoint.lat - center.lat) * Math.PI / 180;
        const dLng = (radiusPoint.lng - center.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(center.lat * Math.PI / 180) * Math.cos(radiusPoint.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const radius = R * c;

        addFeature({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [center.lng, center.lat],
            },
            properties: {
                shapeType: 'circle',
                center: [center.lng, center.lat],
                radius,
            },
        });
    }, [addFeature]);

    /**
     * Creates a linestring feature from collected points
     */
    const createLineString = useCallback((points: LatLng[]) => {
        if (points.length < 2) return;

        const coordinates = points.map(p => [p.lng, p.lat]);

        addFeature({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates,
            },
            properties: {
                shapeType: 'linestring',
            },
        });
    }, [addFeature]);

    /**
     * Handles map click events based on current drawing mode
     */
    const handleClick = useCallback((e: LeafletMouseEvent) => {
        if (!drawingMode) return;

        const { latlng } = e;

        switch (drawingMode) {
            case 'circle':
                if (!drawingState.circleCenter) {
                    // First click - set center
                    setDrawingState(prev => ({ ...prev, circleCenter: latlng }));
                } else {
                    // Second click - create circle with radius
                    createCircle(drawingState.circleCenter, latlng);
                    setDrawingState(prev => ({ ...prev, circleCenter: null }));
                }
                break;

            case 'rectangle':
                if (!drawingState.rectStart) {
                    // First click - set start corner
                    setDrawingState(prev => ({ ...prev, rectStart: latlng }));
                } else {
                    // Second click - create rectangle
                    createRectangle(drawingState.rectStart, latlng);
                    setDrawingState(prev => ({ ...prev, rectStart: null }));
                }
                break;

            case 'polygon':
            case 'linestring':
                // Accumulate points
                setDrawingState(prev => ({
                    ...prev,
                    points: [...prev.points, latlng],
                }));
                break;
        }
    }, [drawingMode, drawingState, createCircle, createRectangle]);

    /**
     * Handles double click to complete polygon/linestring
     */
    const handleDoubleClick = useCallback((e: LeafletMouseEvent) => {
        if (!drawingMode) return;

        e.originalEvent.preventDefault();

        if (drawingMode === 'polygon' && drawingState.points.length >= 3) {
            createPolygon(drawingState.points, 'polygon');
            setDrawingState(prev => ({ ...prev, points: [] }));
        } else if (drawingMode === 'linestring' && drawingState.points.length >= 2) {
            createLineString(drawingState.points);
            setDrawingState(prev => ({ ...prev, points: [] }));
        }
    }, [drawingMode, drawingState.points, createPolygon, createLineString]);

    /**
     * Handles ESC key to cancel drawing
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setDrawingMode(null);
                setDrawingState({
                    points: [],
                    circleCenter: null,
                    rectStart: null,
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setDrawingMode]);

    return {
        drawingState,
        handleClick,
        handleDoubleClick,
    };
}

/**
 * Component that uses map events for drawing
 * Must be used inside MapContainer
 */
export function DrawingEventHandler() {
    const { handleClick, handleDoubleClick } = useDrawingHandler();

    useMapEvents({
        click: handleClick,
        dblclick: handleDoubleClick,
    });

    return null;
}
