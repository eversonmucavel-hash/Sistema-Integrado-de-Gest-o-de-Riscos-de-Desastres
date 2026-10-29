import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    MapPin,
    Gift,
    Building2,
    Layers,
    Calendar,
    AlertCircle,
    Droplets,
    Utensils,
    Home,
    Shirt,
    Heart,
    Hammer,
    Pill,
    Truck,
    Users,
    ClipboardList,
    TrendingUp,
    Warehouse,
} from 'lucide-react';
import resourcesService from '../services/resourcesService';

const STATUS_CONFIG = {
    disponivel: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponível' },
    alocado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Alocado' },
    distribuido: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Distribuído' },
    expirado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expirado' },
};

const CATEGORIA_ICONS = {
    AGUA: Droplets,
    COMIDA: Utensils,
    KIT_HIGIENE: Heart,
    COBERTOR: Home,
    LONA: Layers,
    MEDICAMENTO: Pill,
    ROUPA: Shirt,
    MATERIAL_CONSTRUCAO: Hammer,
};

const CATEGORIA_CORES = {
    AGUA: { bg: 'bg-blue-100', text: 'text-blue-700' },
    COMIDA: { bg: 'bg-orange-100', text: 'text-orange-700' },
    KIT_HIGIENE: { bg: 'bg-pink-100', text: 'text-pink-700' },
    COBERTOR: { bg: 'bg-purple-100', text: 'text-purple-700' },
    LONA: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    MEDICAMENTO: { bg: 'bg-red-100', text: 'text-red-700' },
    ROUPA: { bg: 'bg-teal-100', text: 'text-teal-700' },
    MATERIAL_CONSTRUCAO: { bg: 'bg-gray-200', text: 'text-gray-700' },
};

const formatarData = (dataISO) => {
    if (!dataISO) return '—';
    return new Date(dataISO).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatarDataHora = (dataISO) => {
    if (!dataISO) return '—';
    return new Date(dataISO).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function RecursoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recurso, setRecurso] = useState(null);
    const [distribuicoes, setDistribuicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const recursoRes = await resourcesService.obterRecurso(id);
            setRecurso(recursoRes.data);

            try {
                const distRes = await resourcesService.listarDistribuicoes({
                    recurso: id,
                });
                setDistribuicoes(distRes.data.results || distRes.data || []);
            } catch (e) {
                console.warn('Distribuições não disponíveis:', e);
            }
        } catch (error) {
            console.error('Erro ao carregar recurso:', error);
            setErro('Não foi possível carregar os dados deste recurso.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">A carregar recurso...</p>
            </div>
        );
    }

    if (erro || !recurso) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Recurso não encontrado'}</p>
                <button
                    onClick={() => navigate('/recursos')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[recurso.status] || STATUS_CONFIG.disponivel;
    const Icon = CATEGORIA_ICONS[recurso.categoria_codigo] || Package;
    const cores = CATEGORIA_CORES[recurso.categoria_codigo] || {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
    };

    const disponivel = Number(recurso.quantidade_disponivel || 0);
    const alocada = Number(recurso.quantidade_alocada || 0);
    const distribuida = Number(recurso.quantidade_distribuida || 0);
    const total = disponivel + alocada + distribuida;
    const percDistribuida = total > 0 ? (distribuida / total) * 100 : 0;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/recursos')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar aos recursos
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${cores.bg}`}>
                            <Icon className={`w-7 h-7 ${cores.text}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {recurso.nome}
                            </h1>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.bg} ${statusConfig.text}`}
                                >
                                    {statusConfig.label}
                                </span>
                                {recurso.categoria_nome && (
                                    <span className="text-sm text-gray-600">
                                        {recurso.categoria_nome}
                                    </span>
                                )}
                                {recurso.unidade_medida && (
                                    <span className="text-xs text-gray-400">
                                        ({recurso.unidade_medida})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Cards Grandes de Quantidades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                        <Package className="w-4 h-4" />
                        Disponível
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {disponivel.toLocaleString('pt-MZ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {recurso.unidade_medida || 'unidades'}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                        <ClipboardList className="w-4 h-4" />
                        Alocado
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">
                        {alocada.toLocaleString('pt-MZ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {recurso.unidade_medida || 'unidades'}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Distribuído
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                        {distribuida.toLocaleString('pt-MZ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {recurso.unidade_medida || 'unidades'}
                    </p>
                </div>
            </div>

            {/* Barra de distribuição */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Progresso de Distribuição
                    </h2>
                    <span className="text-sm font-bold text-gray-800">
                        {percDistribuida.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${percDistribuida}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Total: {total.toLocaleString('pt-MZ')}</span>
                    <span>
                        {distribuida.toLocaleString('pt-MZ')} / {total.toLocaleString('pt-MZ')}
                    </span>
                </div>
            </div>

            {/* Informação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Informação Geral
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {recurso.categoria_nome && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Layers className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Categoria</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {recurso.categoria_nome}
                                </span>
                            </div>
                        )}
                        {recurso.unidade_medida && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Unidade de medida
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {recurso.unidade_medida}
                                </span>
                            </div>
                        )}
                        {recurso.distrito_nome && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Distrito</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {recurso.distrito_nome}
                                </span>
                            </div>
                        )}
                        {recurso.local_armazenamento && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Warehouse className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Armazém</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {recurso.local_armazenamento}
                                </span>
                            </div>
                        )}
                        {recurso.data_validade && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Data de validade
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {formatarData(recurso.data_validade)}
                                </span>
                            </div>
                        )}
                        {recurso.data_recepcao && (
                            <div className="flex items-center gap-3 py-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Data de recepção
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {formatarData(recurso.data_recepcao)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Doador */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">Doador</h2>
                    </div>

                    <div className="space-y-4">
                        {recurso.doador && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Gift className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Nome do doador</p>
                                    <p className="font-semibold text-gray-800">
                                        {recurso.doador}
                                    </p>
                                </div>
                            </div>
                        )}

                        {recurso.tipo_doador && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <Building2 className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Tipo</p>
                                    <p className="font-semibold text-gray-800">
                                        {recurso.tipo_doador}
                                    </p>
                                </div>
                            </div>
                        )}

                        {recurso.valor_estimado_mt && (
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Valor estimado</p>
                                    <p className="font-semibold text-gray-800">
                                        {Number(recurso.valor_estimado_mt).toLocaleString(
                                            'pt-MZ'
                                        )}{' '}
                                        MT
                                    </p>
                                </div>
                            </div>
                        )}

                        {!recurso.doador && !recurso.tipo_doador && (
                            <p className="text-sm text-gray-400 text-center py-4">
                                Informação do doador não disponível
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Histórico de Distribuições */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Histórico de Distribuições ({distribuicoes.length})
                    </h2>
                </div>

                {distribuicoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Truck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Nenhuma distribuição registada</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {distribuicoes.map((d) => (
                            <div
                                key={d.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-800">
                                                {d.quantidade} {d.unidade_medida}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                • {formatarDataHora(d.data_distribuicao)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                                            {d.abrigo_nome && (
                                                <span className="flex items-center gap-1">
                                                    <Home className="w-3 h-3" />
                                                    {d.abrigo_nome}
                                                </span>
                                            )}
                                            {d.equipa_nome && (
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {d.equipa_nome}
                                                </span>
                                            )}
                                            {d.numero_beneficiarios && (
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {d.numero_beneficiarios} beneficiários
                                                </span>
                                            )}
                                        </div>
                                        {d.responsavel_nome && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Responsável: {d.responsavel_nome}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}