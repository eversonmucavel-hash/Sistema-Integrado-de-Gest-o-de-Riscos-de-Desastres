
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    MapPin,
    Phone,
    Building2,
    UserCheck,
    Car,
    Backpack,
    Activity,
    Clock,
    Calendar,
    AlertCircle,
    Target,
    Crosshair,
    TrendingUp,
} from 'lucide-react';
import teamsService from '../services/teamsService';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const STATUS_CONFIG = {
    standby: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        dot: 'bg-blue-500',
        label: 'Standby',
    },
    em_missao: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        dot: 'bg-green-500',
        label: 'Em Missão',
    },
    descansando: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        dot: 'bg-yellow-500',
        label: 'A Descansar',
    },
    indisponivel: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        dot: 'bg-gray-500',
        label: 'Indisponível',
    },
};

const MISSAO_STATUS = {
    pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
    em_andamento: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Em Andamento' },
    concluida: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluída' },
    cancelada: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelada' },
};

const formatarData = (dataISO) => {
    if (!dataISO) return '—';
    return new Date(dataISO).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function EquipaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipa, setEquipa] = useState(null);
    const [missoes, setMissoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const equipaRes = await teamsService.obterEquipa(id);
            setEquipa(equipaRes.data);

            try {
                const missoesRes = await teamsService.listarMissoes({ equipa: id });
                setMissoes(missoesRes.data.results || missoesRes.data || []);
            } catch (e) {
                console.warn('Missões não disponíveis:', e);
            }
        } catch (error) {
            console.error('Erro ao carregar equipa:', error);
            setErro('Não foi possível carregar os dados desta equipa.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">A carregar equipa...</p>
            </div>
        );
    }

    if (erro || !equipa) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Equipa não encontrada'}</p>
                <button
                    onClick={() => navigate('/equipas')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[equipa.status] || STATUS_CONFIG.indisponivel;
    const equipamentos = equipa.equipamentos || [];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/equipas')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar às equipas
                </button>

                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {equipa.nome}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.bg} ${statusConfig.text}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                            <span className="font-mono">{equipa.codigo_equipa}</span>
                            {equipa.tipo_equipa_nome && (
                                <>
                                    <span>•</span>
                                    <span>{equipa.tipo_equipa_nome}</span>
                                </>
                            )}
                            {equipa.instituicao && (
                                <>
                                    <span>•</span>
                                    <span>{equipa.instituicao}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {equipa.latitude && equipa.longitude && (
                        <button
                            onClick={() => navigate('/mapa')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <MapPin className="w-4 h-4" />
                            Ver no Mapa
                        </button>
                    )}
                </div>
            </div>

            {/* Grid: Info + Localização */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Informação */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">Informação</h2>
                    </div>

                    <div className="space-y-3">
                        {equipa.tipo_equipa_nome && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Target className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Tipo</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {equipa.tipo_equipa_nome}
                                </span>
                            </div>
                        )}
                        {equipa.instituicao && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Instituição</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {equipa.instituicao}
                                </span>
                            </div>
                        )}
                        {equipa.distrito_atuacao_nome && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Distrito de atuação
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {equipa.distrito_atuacao_nome}
                                </span>
                            </div>
                        )}
                        {equipa.veiculo && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Car className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Veículo</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {equipa.veiculo}
                                </span>
                            </div>
                        )}
                        {equipa.capacidade_atendimento && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Capacidade
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {equipa.capacidade_atendimento} pessoas
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Líder e Localização */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Líder & Localização
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {equipa.lider_nome && (
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <UserCheck className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Líder</p>
                                    <p className="font-medium text-gray-800">
                                        {equipa.lider_nome}
                                    </p>
                                </div>
                                {equipa.lider_telefone && (
                                    <a
                                        href={`tel:${equipa.lider_telefone}`}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        {equipa.lider_telefone}
                                    </a>
                                )}
                            </div>
                        )}

                        {equipa.latitude && equipa.longitude && (
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Crosshair className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">
                                        Localização Atual (GPS)
                                    </p>
                                    <p className="font-mono text-sm text-gray-800">
                                        {Number(equipa.latitude).toFixed(4)},{' '}
                                        {Number(equipa.longitude).toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {equipa.ultima_atualizacao_gps && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                Atualizado: {formatarData(equipa.ultima_atualizacao_gps)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Composição */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Composição</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-gray-500">Membros</p>
                            <p className="font-bold text-blue-700">
                                {equipa.numero_membros || 0}
                            </p>
                        </div>
                    </div>

                    {equipamentos.length > 0 && (
                        <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Backpack className="w-5 h-5 text-gray-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">
                                    Equipamentos ({equipamentos.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {equipamentos.map((eq, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-700"
                                        >
                                            {eq}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {equipa.missao_atual && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700 font-semibold mb-1">
                            Missão em curso
                        </p>
                        <p className="text-sm text-green-800">{equipa.missao_atual}</p>
                    </div>
                )}
            </div>

            {/* Missões */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Missões ({missoes.length})
                    </h2>
                </div>

                {missoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">
                            Nenhuma missão atribuída a esta equipa
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {missoes.map((missao) => {
                            const statusConf =
                                MISSAO_STATUS[missao.status] || MISSAO_STATUS.pendente;
                            return (
                                <div
                                    key={missao.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs text-gray-500">
                                                    {missao.codigo_missao}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConf.bg} ${statusConf.text}`}
                                                >
                                                    {statusConf.label}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-800 mt-1">
                                                {missao.titulo}
                                            </h3>
                                            {missao.descricao && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {missao.descricao}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                                                {missao.data_inicio && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatarData(missao.data_inicio)}
                                                    </span>
                                                )}
                                                {missao.pessoas_atendidas > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {missao.pessoas_atendidas} atendidas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mapa */}
            {equipa.latitude && equipa.longitude && (
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Localização no Mapa
                        </h2>
                    </div>
                    <div
    className="rounded-lg overflow-hidden"
    style={{ height: '400px' }}
>
    <MapContainer
        center={[
            parseFloat(equipa.latitude),
            parseFloat(equipa.longitude),
        ]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
            center={[
                parseFloat(equipa.latitude),
                parseFloat(equipa.longitude),
            ]}
            radius={12}
            pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.9,
                weight: 3,
            }}
        >
            <Popup>
                <strong>{equipa.nome}</strong>
                <br />
                {equipa.instituicao && <>Instituição: {equipa.instituicao}</>}
            </Popup>
        </CircleMarker>
    </MapContainer>
</div>
                </div>
            )}
        </div>
    );
}