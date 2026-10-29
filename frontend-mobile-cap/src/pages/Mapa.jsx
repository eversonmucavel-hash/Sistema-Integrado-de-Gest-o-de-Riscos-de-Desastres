import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import { AlertTriangle, Home, Users, Shield, RefreshCw, Filter, X, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import risksService from '../services/risksService';
import sheltersService from '../services/sheltersService';
import teamsService from '../services/teamsService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CORES_NIVEL = { baixo: '#16a34a', medio: '#eab308', alto: '#f97316', critico: '#dc2626' };
const CENTRO_MZ = [-18.665695, 35.529562];

function ResizeMap() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 200);
    }, [map]);
    return null;
}

export default function MapaGlobal() {
    const [areas, setAreas] = useState([]);
    const [abrigos, setAbrigos] = useState([]);
    const [equipas, setEquipas] = useState([]);
    const [areasSeguras, setAreasSeguras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [filtroNivel, setFiltroNivel] = useState('');
    const [painelAberto, setPainelAberto] = useState(false);

    useEffect(() => { carregarDados(); }, []);

    const carregarDados = async () => {
        setLoading(true);
        setErro(null);
        try {
            const [a, b, c, d] = await Promise.all([
                risksService.listarAreas(),
                sheltersService.listarAbrigos(),
                teamsService.listarEquipas(),
                risksService.listarAreasSeguras(),
            ]);
            setAreas(a.data.results || a.data || []);
            setAbrigos(b.data.results || b.data || []);
            setEquipas(c.data.results || c.data || []);
            setAreasSeguras(d.data.results || d.data || []);
        } catch (e) {
            console.error(e);
            setErro('Erro ao carregar dados.');
        } finally { setLoading(false); }
    };

    const geoToCoords = (geo) => {
        if (!geo) return null;
        try {
            if (geo.type === 'Polygon') return geo.coordinates[0].map(([lng, lat]) => [lat, lng]);
            if (geo.type === 'MultiPolygon') return geo.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
        } catch { }
        return null;
    };

    const areasFiltradas = filtroNivel ? areas.filter(a => a.nivel_risco === filtroNivel) : areas;

    return (
        <div className="relative w-full h-[calc(100vh-56px)]">
            <MapContainer
                center={CENTRO_MZ} zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ResizeMap />

                {areasFiltradas.map(area => {
                    const coords = geoToCoords(area.geometria);
                    if (!coords) return null;
                    const cor = CORES_NIVEL[area.nivel_risco] || '#3b82f6';
                    return (
                        <Polygon key={`a-${area.id}`} positions={coords}
                            pathOptions={{ color: cor, fillColor: cor, fillOpacity: 0.35, weight: 2 }}>
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-bold">{area.nome_area}</p>
                                    <p className="text-xs">Nível: <strong style={{ color: cor }}>{area.nivel_risco}</strong></p>
                                    <p className="text-xs">Pop: {(area.populacao_exposta || 0).toLocaleString('pt-MZ')}</p>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                })}

                {areasSeguras.map(area => {
                    const coords = geoToCoords(area.geometria);
                    if (!coords) return null;
                    return (
                        <Polygon key={`s-${area.id}`} positions={coords}
                            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.25, weight: 2, dashArray: '5,5' }}>
                            <Popup><p className="font-bold text-sm">🛡️ {area.nome}</p></Popup>
                        </Polygon>
                    );
                })}

                {abrigos.map(a => a.latitude && a.longitude && (
                    <CircleMarker key={`ab-${a.id}`}
                        center={[Number(a.latitude), Number(a.longitude)]} radius={8}
                        pathOptions={{ color: '#7c3aed', fillColor: '#a855f7', fillOpacity: 0.9, weight: 2 }}>
                        <Popup>
                            <p className="font-bold text-sm">🏠 {a.nome}</p>
                            <p className="text-xs">{a.ocupacao_atual}/{a.capacidade_maxima} ocupados</p>
                        </Popup>
                    </CircleMarker>
                ))}

                {equipas.map(e => e.latitude && e.longitude && (
                    <CircleMarker key={`eq-${e.id}`}
                        center={[Number(e.latitude), Number(e.longitude)]} radius={8}
                        pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 2 }}>
                        <Popup>
                            <p className="font-bold text-sm">👥 {e.nome}</p>
                            <p className="text-xs">{e.numero_membros} membros</p>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Header flutuante */}
            <div className="absolute top-3 left-3 right-3 z-[1000] flex justify-between items-start gap-2 pointer-events-none">
                <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-2 pointer-events-auto">
                    <h1 className="text-base font-bold text-gray-800">Mapa Global</h1>
                    <p className="text-xs text-gray-500">
                        {areasFiltradas.length} riscos • {abrigos.length} abrigos • {equipas.length} equipas
                    </p>
                </div>
                <button onClick={carregarDados} disabled={loading}
                    className="bg-white/95 backdrop-blur shadow-lg p-3 rounded-xl hover:bg-white transition pointer-events-auto">
                    <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Botão filtros */}
            <button onClick={() => setPainelAberto(!painelAberto)}
                className="absolute bottom-6 right-4 z-[1000] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl">
                {painelAberto ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
            </button>

            {/* Painel de filtros */}
            <div className={`absolute bottom-0 left-0 right-0 z-[999] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${painelAberto ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '70vh' }}>
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
                <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 30px)' }}>
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Filtrar por Nível
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            { v: '', l: 'Todos', c: '#64748b' },
                            { v: 'critico', l: 'Crítico', c: '#dc2626' },
                            { v: 'alto', l: 'Alto', c: '#f97316' },
                            { v: 'medio', l: 'Médio', c: '#eab308' },
                            { v: 'baixo', l: 'Baixo', c: '#16a34a' },
                        ].map(opt => (
                            <button key={opt.v} onClick={() => setFiltroNivel(opt.v)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${filtroNivel === opt.v ? 'bg-blue-50 text-blue-700 border-2 border-blue-500' : 'bg-gray-50 text-gray-700 border-2 border-transparent'}`}>
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.c }} />
                                {opt.l}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500" />
                        Legenda
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#dc2626', opacity: 0.6 }} /> Crítico</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#f97316', opacity: 0.6 }} /> Alto</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#eab308', opacity: 0.6 }} /> Médio</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#16a34a', opacity: 0.6 }} /> Baixo</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#a855f7' }} /> Abrigo</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#38bdf8' }} /> Equipa</div>
                    </div>
                </div>
            </div>

            {erro && (
                <div className="absolute top-20 left-3 right-3 z-[1000] bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg shadow-lg text-sm">
                    {erro}
                </div>
            )}
        </div>
    );
}