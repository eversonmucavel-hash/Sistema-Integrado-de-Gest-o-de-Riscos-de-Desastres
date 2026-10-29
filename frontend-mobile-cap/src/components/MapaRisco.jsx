import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';

import L from 'leaflet';

// Corrigir os ícones do Leaflet para funcionar no Capacitor
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ geometry }) {
    const map = useMap();

    useEffect(() => {
        if (!geometry) return;
        try {
            const coords = geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
            map.fitBounds(coords, { padding: [30, 30] });
        } catch (e) {
            console.error('Erro no fitBounds:', e);
        }
    }, [geometry, map]);

    return null;
}

const CORES_NIVEL = {
    baixo: '#16a34a',
    medio: '#eab308',
    alto: '#f97316',
    critico: '#dc2626',
};

export default function MapaRisco({ geometria, nivel, nome }) {
    if (!geometria) {
        return (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Sem geometria disponível</p>
            </div>
        );
    }

    let coords = [];
    try {
        if (geometria.type === 'Polygon') {
            coords = geometria.coordinates[0].map(([lng, lat]) => [lat, lng]);
        } else if (geometria.type === 'MultiPolygon') {
            coords = geometria.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
        }
    } catch (e) {
        console.error('Erro a processar geometria:', e);
    }

    if (coords.length === 0) {
        return (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Geometria inválida</p>
            </div>
        );
    }

    const cor = CORES_NIVEL[nivel] || '#3b82f6';
    const centro = coords[0];

    return (
        <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <MapContainer
                center={centro}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polygon
                    positions={coords}
                    pathOptions={{
                        color: cor,
                        fillColor: cor,
                        fillOpacity: 0.35,
                        weight: 3,
                    }}
                >
                    <Popup>
                        <strong>{nome}</strong>
                        <br />
                        Nível: <span style={{ color: cor, fontWeight: 'bold' }}>{nivel}</span>
                    </Popup>
                </Polygon>
                <FitBounds geometry={geometria} />
            </MapContainer>
        </div>
    );
}