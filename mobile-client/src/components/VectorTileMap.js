import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const VectorTileMap = ({ projectId, groupId, style: containerStyle = {} }) => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const token = localStorage.getItem('token');
        const tileParam = projectId
            ? `project_id=${projectId}`
            : groupId
            ? `group_id=${groupId}`
            : '';

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap contributors',
                    },
                    geodata: {
                        type: 'vector',
                        tiles: [`${window.location.origin}/api/mobile/tiles/{z}/{x}/{y}.pbf?${tileParam}`],
                        maxzoom: 18,
                    },
                },
                layers: [
                    { id: 'osm', type: 'raster', source: 'osm' },
                    {
                        id: 'geodata-polygon',
                        type: 'fill',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'fill-color': '#4caf50',
                            'fill-opacity': 0.25,
                            'fill-outline-color': '#2e7d32',
                        },
                    },
                    {
                        id: 'geodata-polygon-outline',
                        type: 'line',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'line-color': '#2e7d32',
                            'line-width': 2,
                        },
                    },
                    {
                        id: 'geodata-line',
                        type: 'line',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'LineString'],
                        paint: {
                            'line-color': '#1565c0',
                            'line-width': 3,
                        },
                    },
                    {
                        id: 'geodata-point',
                        type: 'circle',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Point'],
                        paint: {
                            'circle-radius': 7,
                            'circle-color': '#388e3c',
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#ffffff',
                        },
                    },
                ],
            },
            center: [110.5, -2.5],
            zoom: 10,
            transformRequest: (url) => {
                if (url.includes('/api/mobile/tiles/') && token) {
                    return {
                        url,
                        headers: { Authorization: `Token ${token}` },
                    };
                }
                return { url };
            },
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        const clickLayers = ['geodata-point', 'geodata-line', 'geodata-polygon'];

        map.on('click', clickLayers, (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const props = feature.properties;
                const html = Object.entries(props)
                    .map(([k, v]) => `<strong style="color:#2e7d32">${k}:</strong> ${v}`)
                    .join('<br/>');
                new maplibregl.Popup({ maxWidth: '300px' })
                    .setLngLat(e.lngLat)
                    .setHTML(`<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;line-height:1.6">${html}</div>`)
                    .addTo(map);
            }
        });

        map.on('mouseenter', clickLayers, () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', clickLayers, () => {
            map.getCanvas().style.cursor = '';
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [projectId, groupId]);

    return (
        <div
            ref={mapContainer}
            style={{ width: '100%', height: 500, borderRadius: 8, ...containerStyle }}
        />
    );
};

export default VectorTileMap;
