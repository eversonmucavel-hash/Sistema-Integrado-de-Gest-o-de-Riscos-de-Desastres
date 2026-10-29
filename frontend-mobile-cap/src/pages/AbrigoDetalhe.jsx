import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    MapPin,
    Users,
    Home,
    Droplets,
    Zap,
    ShowerHead,
    Utensils,
    Heart,
    Phone,
    User,
    AlertCircle,
    Calendar,
    X,
    TrendingUp,
} from 'lucide-react';
import sheltersService from '../services/sheltersService';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const STATUS_CONFIG = {
    aberto: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aberto' },
    lotado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Lotado' },
    fechado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Fechado' },
    em_preparacao: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Preparação' },
};

function BarraOcupacao({ ocupacao, capacidade }) {
    const percentagem = capacidade > 0 ? Math.min((ocupacao / capacidade) * 100, 100) : 0;

    let cor = 'bg-green-500';
    let corTexto = 'text-green-600';
    if (percentagem >= 90) {
        cor = 'bg-red-500';
        corTexto = 'text-red-600';
    } else if (percentagem >= 70) {
        cor = 'bg-orange-500';
        corTexto = 'text-orange-600';
    } else if (percentagem >= 40) {
        cor = 'bg-yellow-500';
        corTexto = 'text-yellow-600';
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Ocupação</span>
                <span className={`text-2xl font-bold ${corTexto}`}>
                    {percentagem.toFixed(0)}%
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${cor} transition-all duration-500`}
                    style={{ width: `${percentagem}%` }}
                />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{ocupacao} ocupados</span>
                <span>{capacidade} capacidade</span>
            </div>
        </div>
    );
}

export default function AbrigoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [abrigo, setAbrigo] = useState(null);
    const [deslocados, setDeslocados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [abrigoRes, deslocadosRes] = await Promise.all([
                sheltersService.obterAbrigo(id),
                sheltersService.listarDeslocados({ abrigo: id, status: 'ativo' }),
            ]);
            setAbrigo(abrigoRes.data);
            setDeslocados(deslocadosRes.data.results || deslocadosRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar abrigo:', error);
            setErro('Não foi possível carregar os dados deste abrigo.');
        } finally {
            setLoading(false);
        }
    };

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return '—';
        const nasc = new Date(dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return `${idade} anos`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">A carregar abrigo...</p>
            </div>
        );
    }

    if (erro || !abrigo) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Abrigo não encontrado'}</p>
                <button
                    onClick={() => navigate('/abrigos')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[abrigo.status] || STATUS_CONFIG.fechado;
    const vagasDisponiveis = Math.max(
        0,
        (abrigo.capacidade_maxima || 0) - (abrigo.ocupacao_atual || 0)
    );

    const infraestruturas = [
        { key: 'tem_agua', label: 'Água Potável', icon: Droplets, color: 'text-blue-600' },
        { key: 'tem_energia', label: 'Energia Elétrica', icon: Zap, color: 'text-yellow-600' },
        { key: 'tem_saneamento', label: 'Saneamento', icon: ShowerHead, color: 'text-cyan-600' },
        { key: 'tem_cozinha', label: 'Cozinha', icon: Utensils, color: 'text-orange-600' },
        { key: 'tem_area_saude', label: 'Área de Saúde', icon: Heart, color: 'text-red-600' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/abrigos')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar aos abrigos
                </button>

                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">{abrigo.nome}</h1>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.bg} ${statusConfig.text}`}
                            >
                                {statusConfig.label}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                                {abrigo.tipo}
                            </span>
                            {abrigo.distrito_nome && (
                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {abrigo.distrito_nome}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                        Editar
                    </button>
                </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Ocupação */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">Ocupação</h2>
                    </div>

                    <BarraOcupacao
                        ocupacao={abrigo.ocupacao_atual || 0}
                        capacidade={abrigo.capacidade_maxima || 0}
                    />

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Capacidade</p>
                            <p className="text-xl font-bold text-gray-800">
                                {abrigo.capacidade_maxima}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Ocupados</p>
                            <p className="text-xl font-bold text-blue-600">
                                {abrigo.ocupacao_atual}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Disponíveis</p>
                            <p className="text-xl font-bold text-green-600">
                                {vagasDisponiveis}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Infraestrutura */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Home className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Infraestrutura
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {infraestruturas.map((item) => {
                            const Icon = item.icon;
                            const tem = abrigo[item.key];
                            return (
                                <div
                                    key={item.key}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${
                                        tem ? 'bg-gray-50' : 'bg-gray-50 opacity-50'
                                    }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${
                                            tem ? item.color : 'text-gray-300'
                                        }`}
                                    />
                                    <span className="flex-1 text-sm text-gray-700">
                                        {item.label}
                                    </span>
                                    {tem ? (
                                        <span className="text-xs font-semibold text-green-600">
                                            Disponível
                                        </span>
                                    ) : (
                                        <X className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Responsável</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Nome</p>
                            <p className="font-medium text-gray-800">
                                {abrigo.responsavel || '—'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Telefone</p>
                            <p className="font-mono font-medium text-gray-800">
                                {abrigo.telefone_contacto || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deslocados */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Deslocados ({deslocados.length})
                        </h2>
                    </div>
                </div>

                {deslocados.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Nenhum deslocado registado neste abrigo</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                                <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="py-2 px-3">Nome</th>
                                    <th className="py-2 px-3">Sexo</th>
                                    <th className="py-2 px-3">Idade</th>
                                    <th className="py-2 px-3">Acompanhantes</th>
                                    <th className="py-2 px-3">Vulnerável</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deslocados.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-3 font-medium text-gray-800">
                                            {d.nome_completo}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600">
                                            {d.sexo || '—'}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600">
                                            {calcularIdade(d.data_nascimento)}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600">
                                            {d.numero_acompanhantes || 0}
                                        </td>
                                        <td className="py-3 px-3">
                                            {d.vulneravel ? (
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                                                    Sim
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mapa */}
            {abrigo.latitude && abrigo.longitude && (
    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Localização
        </h2>
        <div
            className="rounded-lg overflow-hidden"
            style={{ height: '400px' }}
        >
            <MapContainer
                center={[
                    parseFloat(abrigo.latitude),
                    parseFloat(abrigo.longitude),
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
                        parseFloat(abrigo.latitude),
                        parseFloat(abrigo.longitude),
                    ]}
                    radius={12}
                    pathOptions={{
                        color: '#7c3aed',
                        fillColor: '#a855f7',
                        fillOpacity: 0.9,
                        weight: 3,
                    }}
                >
                    <Popup>
                        <strong>{abrigo.nome}</strong>
                        <br />
                        {abrigo.distrito_nome && <>Distrito: {abrigo.distrito_nome}</>}
                    </Popup>
                </CircleMarker>
            </MapContainer>
        </div>
    </div>
)}
        </div>
    );
}