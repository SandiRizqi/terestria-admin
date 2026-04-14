import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class MapField extends Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();
    }

    componentDidMount() {
        this.fitBounds();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.record !== this.props.record) {
            this.fitBounds();
        }
    }

    fitBounds() {
        const { record, source = 'geom_geojson' } = this.props;
        const geojson = record && record[source];
        if (!geojson || !this.mapRef.current) return;

        try {
            const feature = { type: 'Feature', geometry: geojson, properties: {} };
            const layer = L.geoJSON(feature);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                this.mapRef.current.leafletElement.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 16,
                });
            }
        } catch (e) {
            // ignore invalid geojson
        }
    }

    render() {
        const { record, source = 'geom_geojson' } = this.props;
        const geojson = record && record[source];

        if (!geojson) {
            return (
                <div style={{
                    padding: 24,
                    color: '#6b8f6b',
                    backgroundColor: '#f6faf6',
                    borderRadius: 8,
                    border: '1px dashed #c8e6c9',
                    textAlign: 'center',
                }}>
                    No geometry data available
                </div>
            );
        }

        const feature = { type: 'Feature', geometry: geojson, properties: {} };

        return (
            <div style={{
                height: 500,
                width: '100%',
                marginTop: 8,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e0ece0',
                boxShadow: '0 2px 8px rgba(46,125,50,0.08)',
            }}>
                <Map
                    ref={this.mapRef}
                    center={[0, 0]}
                    zoom={4}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <GeoJSON
                        data={feature}
                        style={(f) => {
                            const t = f && f.geometry && f.geometry.type;
                            if (t === 'Point' || t === 'MultiPoint') {
                                return { color: '#e53935', weight: 3, fillColor: '#e53935', fillOpacity: 0.3 };
                            }
                            if (t === 'LineString' || t === 'MultiLineString') {
                                return { color: '#1565c0', weight: 3, fillOpacity: 0 };
                            }
                            return { color: '#2e7d32', weight: 3, fillColor: '#4caf50', fillOpacity: 0.2 };
                        }}
                    />
                </Map>
            </div>
        );
    }
}

MapField.defaultProps = { addLabel: true };

export default MapField;
