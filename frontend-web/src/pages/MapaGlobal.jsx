import { useState, useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Polygon,
    Marker,
    Popup,
    CircleMarker,
    LayersControl,
} from 'react-leaflet';
import { AlertTriangle, Home, Users, Shield, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import risksService from '../services/risksService';
import sheltersService from '../services/sheltersService';
import teamsService from '../services/teamsService';

// Fix para ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CORES_NIVEL = {
    baixo: '#16a34a',
    medio: '#eab308',
    alto: '#f97316',
    critico: '#dc2626',
};

// Centro de Moçambique
const CENTRO_MZ = [-18.665695, 35.529562];

export default function MapaGlobal() {
    const [areas, setAreas] = useState([]);
    const [abrigos, setAbrigos] = useState([]);
    const [equipas, setEquipas] = useState([]);
    const [areasSeguras, setAreasSeguras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [filtroNivel, setFiltroNivel] = useState('');

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setErro(null);
        try {
            const [areasRes, abrigosRes, equipasRes, segurasRes] = await Promise.all([
                risksService.listarAreas(),
                sheltersService.listarAbrigos(),
                teamsService.listarEquipas(),
                risksService.listarAreasSeguras(),
            ]);

            setAreas(areasRes.data.results || areasRes.data || []);
            setAbrigos(abrigosRes.data.results || abrigosRes.data || []);
            setEquipas(equipasRes.data.results || equipasRes.data || []);
            setAreasSeguras(segurasRes.data.results || segurasRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar dados do mapa. Verifica o backend.');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar áreas por nível
    const areasFiltradas = filtroNivel
        ? areas.filter((a) => a.nivel_risco === filtroNivel)
        : areas;

    // Converter geometria GeoJSON para coordenadas Leaflet
    const geoToCoords = (geometria) => {
        if (!geometria) return null;
        try {
            if (geometria.type === 'Polygon') {
                return geometria.coordinates[0].map(([lng, lat]) => [lat, lng]);
            }
            if (geometria.type === 'MultiPolygon') {
                return geometria.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
            }
        } catch (e) {
            console.error('Erro a processar geometria:', e);
        }
        return null;
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mapa Global</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Visualização geoespacial de Moçambique
                    </p>
                </div>
                <button
                    onClick={carregarDados}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {erro}
                </div>
            )}

            {/* Layout principal: Mapa + Sidebar */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Mapa */}
                <div className="flex-1 bg-white rounded-xl shadow overflow-hidden">
                    <MapContainer
                        center={CENTRO_MZ}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <LayersControl position="topright">
                            {/* Áreas de Risco */}
                            <LayersControl.Overlay checked name="⚠️ Áreas de Risco">
                                <></>
                            </LayersControl.Overlay>

                            {/* Áreas Seguras */}
                            <LayersControl.Overlay checked name="🛡️ Áreas Seguras">
                                <></>
                            </LayersControl.Overlay>

                            {/* Abrigos */}
                            <LayersControl.Overlay checked name="🏠 Abrigos">
                                <></>
                            </LayersControl.Overlay>

                            {/* Equipas */}
                            <LayersControl.Overlay checked name="👥 Equipas">
                                <></>
                            </LayersControl.Overlay>
                        </LayersControl>

                        {/* Polígonos de áreas de risco */}
                        {areasFiltradas.map((area) => {
                            const coords = geoToCoords(area.geometria);
                            if (!coords) return null;
                            const cor = CORES_NIVEL[area.nivel_risco] || '#3b82f6';
                            return (
                                <Polygon
                                    key={`area-${area.id}`}
                                    positions={coords}
                                    pathOptions={{
                                        color: cor,
                                        fillColor: cor,
                                        fillOpacity: 0.35,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">{area.nome_area}</p>
                                            <p className="text-xs text-gray-600">
                                                Tipo: {area.tipo_risco_nome || '—'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Nível:{' '}
                                                <span style={{ color: cor, fontWeight: 'bold' }}>
                                                    {area.nivel_risco}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Pop. exposta:{' '}
                                                {(area.populacao_exposta || 0).toLocaleString('pt-MZ')}
                                            </p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            );
                        })}

                        {/* Polígonos de áreas seguras */}
                        {areasSeguras.map((area) => {
                            const coords = geoToCoords(area.geometria);
                            if (!coords) return null;
                            return (
                                <Polygon
                                    key={`seg-${area.id}`}
                                    positions={coords}
                                    pathOptions={{
                                        color: '#0ea5e9',
                                        fillColor: '#0ea5e9',
                                        fillOpacity: 0.3,
                                        weight: 2,
                                        dashArray: '5, 5',
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">{area.nome}</p>
                                            <p className="text-xs text-gray-600">
                                                Tipo: {area.tipo}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Capacidade: {area.capacidade_pessoas || '—'}
                                            </p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            );
                        })}

                        {/* Abrigos - marcadores */}
                        {abrigos.map((abrigo) => {
                            if (!abrigo.latitude || !abrigo.longitude) return null;
                            return (
                                <CircleMarker
                                    key={`abrigo-${abrigo.id}`}
                                    center={[abrigo.latitude, abrigo.longitude]}
                                    radius={8}
                                    pathOptions={{
                                        color: '#7c3aed',
                                        fillColor: '#a855f7',
                                        fillOpacity: 0.9,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">🏠 {abrigo.nome}</p>
                                            <p className="text-xs text-gray-600">
                                                Tipo: {abrigo.tipo}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Capacidade: {abrigo.capacidade_maxima}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Ocupação: {abrigo.ocupacao_atual}
                                            </p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}

                        {/* Equipas - marcadores */}
                        {equipas.map((equipa) => {
                            if (!equipa.latitude || !equipa.longitude) return null;
                            return (
                                <CircleMarker
                                    key={`equipa-${equipa.id}`}
                                    center={[equipa.latitude, equipa.longitude]}
                                    radius={8}
                                    pathOptions={{
                                        color: '#0284c7',
                                        fillColor: '#38bdf8',
                                        fillOpacity: 0.9,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">👥 {equipa.nome}</p>
                                            <p className="text-xs text-gray-600">
                                                Instituição: {equipa.instituicao || '—'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Membros: {equipa.numero_membros || '—'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Status: {equipa.status}
                                            </p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Sidebar de filtros e legenda */}
                <div className="w-72 flex flex-col gap-4 overflow-y-auto">
                    {/* Estatísticas */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-semibold text-gray-800 text-sm mb-3">
                            Estatísticas
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{areasFiltradas.length} riscos</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-600">
                                <Home className="w-4 h-4" />
                                <span>{abrigos.length} abrigos</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600">
                                <Users className="w-4 h-4" />
                                <span>{equipas.length} equipas</span>
                            </div>
                            <div className="flex items-center gap-2 text-cyan-600">
                                <Shield className="w-4 h-4" />
                                <span>{areasSeguras.length} seguras</span>
                            </div>
                        </div>
                    </div>

                    {/* Filtro de Nível */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-semibold text-gray-800 text-sm mb-3">
                            Filtrar por Nível
                        </h3>
                        <div className="space-y-1">
                            {[
                                { v: '', l: 'Todos', c: null },
                                { v: 'critico', l: 'Crítico', c: '#dc2626' },
                                { v: 'alto', l: 'Alto', c: '#f97316' },
                                { v: 'medio', l: 'Médio', c: '#eab308' },
                                { v: 'baixo', l: 'Baixo', c: '#16a34a' },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setFiltroNivel(opt.v)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                                        filtroNivel === opt.v
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {opt.c && (
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: opt.c }}
                                        />
                                    )}
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legenda */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-semibold text-gray-800 text-sm mb-3">Legenda</h3>
                        <div className="space-y-2 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: '#dc2626', opacity: 0.5 }}
                                />
                                <span>Crítico</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: '#f97316', opacity: 0.5 }}
                                />
                                <span>Alto</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: '#eab308', opacity: 0.5 }}
                                />
                                <span>Médio</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: '#16a34a', opacity: 0.5 }}
                                />
                                <span>Baixo</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <span
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: '#a855f7' }}
                                />
                                <span>Abrigo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: '#38bdf8' }}
                                />
                                <span>Equipa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded border-2 border-dashed"
                                    style={{ borderColor: '#0ea5e9' }}
                                />
                                <span>Área Segura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}