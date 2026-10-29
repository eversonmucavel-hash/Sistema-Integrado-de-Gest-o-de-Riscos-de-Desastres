import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Trash2, Map as MapIcon, Pencil, Square } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import risksService from '../../services/risksService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTRO_MZ = [-18.665695, 35.529562];

// Componente interno que tem acesso ao mapa
function DesenhoPoligono({ onCreated, geometria, onLimpar }) {
    const map = useMap();
    const desenhadoRef = useRef(null);
    const [desenhando, setDesenhando] = useState(false);

    useEffect(() => {
        // Se já existe geometria (edição futura), desenha-a
        if (geometria && geometria.coordinates) {
            const coords = geometria.coordinates[0].map(([lng, lat]) => [lat, lng]);
            if (desenhadoRef.current) {
                map.removeLayer(desenhadoRef.current);
            }
            desenhadoRef.current = L.polygon(coords, {
                color: '#dc2626',
                fillOpacity: 0.3,
                weight: 2,
            }).addTo(map);
        }
    }, [geometria, map]);

    const iniciarDesenho = () => {
        const drawer = new L.Draw.Polygon(map, {
            allowIntersection: false,
            shapeOptions: {
                color: '#dc2626',
                fillOpacity: 0.3,
                weight: 2,
            },
        });

        // Remove desenho anterior
        if (desenhadoRef.current) {
            map.removeLayer(desenhadoRef.current);
            desenhadoRef.current = null;
        }

        drawer.enable();
        setDesenhando(true);

        map.once('draw:created', (e) => {
            const layer = e.layer;
            const geoJSON = layer.toGeoJSON();

            desenhadoRef.current = layer;
            layer.addTo(map);

            setDesenhando(false);
            onCreated(geoJSON.geometry);
        });
    };

    const limpar = () => {
        if (desenhadoRef.current) {
            map.removeLayer(desenhadoRef.current);
            desenhadoRef.current = null;
        }
        setDesenhando(false);
        onLimpar();
    };

    return (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <button
                type="button"
                onClick={iniciarDesenho}
                disabled={desenhando}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition ${
                    desenhando
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Desenhar área"
            >
                <Pencil className="w-4 h-4" />
                {desenhando ? 'A desenhar...' : 'Desenhar'}
            </button>

            {desenhadoRef.current && (
                <button
                    type="button"
                    onClick={limpar}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-white text-red-600 hover:bg-red-50 text-sm font-medium transition"
                    title="Limpar desenho"
                >
                    <Trash2 className="w-4 h-4" />
                    Limpar
                </button>
            )}
        </div>
    );
}

export default function AreaRiscoForm({ onSuccess, onCancel }) {
    const [distritos, setDistritos] = useState([]);
    const [tiposRisco, setTiposRisco] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});
    const [geometria, setGeometria] = useState(null);
    const [poligonoId, setPoligonoId] = useState(0); // força re-render

    const [form, setForm] = useState({
        nome_area: '',
        descricao: '',
        distrito: '',
        tipo_risco: '',
        nivel_risco: 'medio',
        probabilidade: 'possivel',
        impacto: 'moderado',
        populacao_exposta: '',
        familias_expostas: '',
        escolas_em_risco: 0,
        centros_saude_em_risco: 0,
        habitacoes_em_risco: 0,
        fonte_dados: 'Satélite',
        validado: false,
        ativo: true,
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [distritosRes, tiposRes] = await Promise.all([
                risksService.listarDistritos(),
                risksService.listarTipos(),
            ]);
            setDistritos(distritosRes.data.results || distritosRes.data || []);
            setTiposRisco(tiposRes.data.results || tiposRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar distritos e tipos de risco.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (erros[name]) {
            setErros((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleGeometriaCriada = (geom) => {
        setGeometria(geom);
        setPoligonoId((prev) => prev + 1);
        if (erros.geometria) {
            setErros((prev) => ({ ...prev, geometria: '' }));
        }
    };

    const handleLimparGeometria = () => {
        setGeometria(null);
        setPoligonoId((prev) => prev + 1);
    };

    const validar = () => {
        const novosErros = {};

        if (!form.nome_area.trim()) novosErros.nome_area = 'Nome é obrigatório';
        if (!form.distrito) novosErros.distrito = 'Distrito é obrigatório';
        if (!form.tipo_risco) novosErros.tipo_risco = 'Tipo de risco é obrigatório';
        if (!form.nivel_risco) novosErros.nivel_risco = 'Nível é obrigatório';
        if (!geometria) novosErros.geometria = 'Desenhe uma área no mapa';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (!validar()) return;

        setLoading(true);

        const payload = {
            nome_area: form.nome_area.trim(),
            distrito: Number(form.distrito),
            tipo_risco: Number(form.tipo_risco),
            nivel_risco: form.nivel_risco,
            geometria: geometria,
            validado: form.validado,
            ativo: form.ativo,
            escolas_em_risco: Number(form.escolas_em_risco) || 0,
            centros_saude_em_risco: Number(form.centros_saude_em_risco) || 0,
            habitacoes_em_risco: Number(form.habitacoes_em_risco) || 0,
        };

        if (form.descricao.trim()) payload.descricao = form.descricao.trim();
        if (form.probabilidade) payload.probabilidade = form.probabilidade;
        if (form.impacto) payload.impacto = form.impacto;
        if (form.populacao_exposta)
            payload.populacao_exposta = Number(form.populacao_exposta);
        if (form.familias_expostas)
            payload.familias_expostas = Number(form.familias_expostas);
        if (form.fonte_dados.trim()) payload.fonte_dados = form.fonte_dados.trim();

        try {
    const response = await sheltersService.criarArea(payload);
    toast.success('Area criado com sucesso');
    onSuccess(response.data);
} catch (error) {
    console.error('Erro ao criar Area:', error);
    const dados = error.response?.data;
    if (dados && typeof dados === 'object') {
        const primeiro = Object.entries(dados)[0];
        setErro(`${primeiro[0]}: ${primeiro[1]}`);
    } else {
        setErro('Erro ao criar o Area.');
    }
    toast.error('Erro ao criar o Area');
} finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">A carregar dados...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {erro}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da área <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="nome_area"
                    value={form.nome_area}
                    onChange={handleChange}
                    placeholder="Ex: Zona Costeira da Beira"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.nome_area ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.nome_area && (
                    <p className="text-xs text-red-600 mt-1">{erros.nome_area}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Detalhes sobre a área de risco..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distrito <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="distrito"
                        value={form.distrito}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.distrito ? 'border-red-400' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Selecione...</option>
                        {distritos.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.nome}
                            </option>
                        ))}
                    </select>
                    {erros.distrito && (
                        <p className="text-xs text-red-600 mt-1">{erros.distrito}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de risco <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_risco"
                        value={form.tipo_risco}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.tipo_risco ? 'border-red-400' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Selecione...</option>
                        {tiposRisco.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nome}
                            </option>
                        ))}
                    </select>
                    {erros.tipo_risco && (
                        <p className="text-xs text-red-600 mt-1">{erros.tipo_risco}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nível <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="nivel_risco"
                        value={form.nivel_risco}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="baixo">Baixo</option>
                        <option value="medio">Médio</option>
                        <option value="alto">Alto</option>
                        <option value="critico">Crítico</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Probabilidade
                    </label>
                    <select
                        name="probabilidade"
                        value={form.probabilidade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="rara">Rara</option>
                        <option value="possivel">Possível</option>
                        <option value="provavel">Provável</option>
                        <option value="certa">Certa</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impacto
                    </label>
                    <select
                        name="impacto"
                        value={form.impacto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="minimo">Mínimo</option>
                        <option value="moderado">Moderado</option>
                        <option value="grave">Grave</option>
                        <option value="catastrofico">Catastrófico</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        População exposta
                    </label>
                    <input
                        type="number"
                        name="populacao_exposta"
                        value={form.populacao_exposta}
                        onChange={handleChange}
                        min="0"
                        placeholder="Ex: 50000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Famílias expostas
                    </label>
                    <input
                        type="number"
                        name="familias_expostas"
                        value={form.familias_expostas}
                        onChange={handleChange}
                        min="0"
                        placeholder="Ex: 10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Escolas em risco
                    </label>
                    <input
                        type="number"
                        name="escolas_em_risco"
                        value={form.escolas_em_risco}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Centros de saúde
                    </label>
                    <input
                        type="number"
                        name="centros_saude_em_risco"
                        value={form.centros_saude_em_risco}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Habitações em risco
                    </label>
                    <input
                        type="number"
                        name="habitacoes_em_risco"
                        value={form.habitacoes_em_risco}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte de dados
                </label>
                <input
                    type="text"
                    name="fonte_dados"
                    value={form.fonte_dados}
                    onChange={handleChange}
                    placeholder="Ex: Satélite, Drone, Terreno"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapIcon className="w-4 h-4" />
                        Área no mapa <span className="text-red-500">*</span>
                    </label>
                    {geometria && (
                        <span className="text-xs text-green-600 font-medium">
                            Polígono desenhado
                        </span>
                    )}
                </div>

                <div
                    className={`relative rounded-lg overflow-hidden border-2 ${
                        erros.geometria ? 'border-red-400' : 'border-gray-200'
                    }`}
                    style={{ height: '400px' }}
                >
                    <MapContainer
                        key={poligonoId}
                        center={CENTRO_MZ}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <DesenhoPoligono
                            geometria={geometria}
                            onCreated={handleGeometriaCriada}
                            onLimpar={handleLimparGeometria}
                        />
                    </MapContainer>
                </div>

                {erros.geometria && (
                    <p className="text-xs text-red-600 mt-1">{erros.geometria}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Clique em "Desenhar" e depois no mapa para marcar os pontos. Clique
                    no primeiro ponto para fechar o polígono.
                </p>
            </div>

            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="validado"
                        checked={form.validado}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Validado
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="ativo"
                        checked={form.ativo}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Ativo
                </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {loading ? 'A guardar...' : 'Criar Área'}
                </button>
            </div>
        </form>
    );
}