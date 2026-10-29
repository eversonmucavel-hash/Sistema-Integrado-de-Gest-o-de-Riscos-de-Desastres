import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import AlertaForm from '../components/forms/AlertaForm';
import { SkeletonCard } from '../components/Skeleton';   // ← NOVO
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Bell,
    Search,
    Plus,
    Filter,
    AlertCircle,
    AlertTriangle,
    Info,
    Radio,
    Smartphone,
    Megaphone,
    X,
    Calendar,
    MapPin,
    Users,
} from 'lucide-react';
import alertsService from '../services/alertsService';

const NIVEL_CONFIG = {
    informativo: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800',
        icon: Info,
        label: 'Informativo',
    },
    atencao: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: 'Atenção',
    },
    urgente: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
        label: 'Urgente',
    },
    critico: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Crítico',
    },
};

const CANAIS_ICONS = {
    SMS: Smartphone,
    APP: Bell,
    WEB: Megaphone,
    RADIO: Radio,
    EMAIL: Megaphone,
    USSD: Smartphone,
};

export default function Alertas() {
    const confirmar = useConfirm();
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate();
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');

    useEffect(() => {
        loadAlertas();
    }, []);

    const loadAlertas = async () => {
        try {
            const response = await alertsService.listarAlertas();
            setAlertas(response.data.results || response.data || []);
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
            setErro('Erro ao carregar alertas. Verifica o backend.');
        } finally {
            setLoading(false);
        }
    };

   const cancelarAlerta = async (id) => {
    const ok = await confirmar({
        titulo: 'Cancelar alerta',
        mensagem: 'Tens a certeza que queres cancelar este alerta? Esta ação não pode ser revertida.',
        textoConfirmar: 'Cancelar alerta',
        variante: 'danger',
    });
    if (!ok) return;

    try {
        await alertsService.cancelarAlerta(id);
        toast.success('Alerta cancelado com sucesso');
        loadAlertas();
    } catch (error) {
        console.error('Erro ao cancelar alerta:', error);
        toast.error('Erro ao cancelar o alerta');
    }
};

    const alertasFiltrados = alertas.filter((a) => {
        const matchSearch =
            !search ||
            a.titulo?.toLowerCase().includes(search.toLowerCase()) ||
            a.mensagem?.toLowerCase().includes(search.toLowerCase());

        const matchNivel = !filtroNivel || a.nivel === filtroNivel;

        return matchSearch && matchNivel;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroNivel('');
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

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Alertas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {alertasFiltrados.length} de {alertas.length} alertas
                    </p>
                </div>
                <button
    onClick={() => setModalAberto(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
>
    <Plus className="w-4 h-4" />
    Novo Alerta
</button>
<Modal
    isOpen={modalAberto}
    onClose={() => setModalAberto(false)}
    title="Novo Alerta"
    size="xl"
>
    <AlertaForm
        onSuccess={() => {
            setModalAberto(false);
            loadAlertas();
        }}
        onCancel={() => setModalAberto(false)}
    />
</Modal>
            </div>

            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {erro}
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold text-sm">Filtros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar alertas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os níveis</option>
                        <option value="informativo">Informativo</option>
                        <option value="atencao">Atenção</option>
                        <option value="urgente">Urgente</option>
                        <option value="critico">Crítico</option>
                    </select>

                    {(search || filtroNivel) && (
                        <button
                            onClick={limparFiltros}
                            className="text-sm text-blue-600 hover:text-blue-800 text-left"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Lista */}
            {loading ? (
    <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
    </div>
) : alertasFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {alertas.length === 0
                            ? 'Nenhum alerta registado'
                            : 'Nenhum alerta encontrado com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alertasFiltrados.map((alerta) => {
                        const config = NIVEL_CONFIG[alerta.nivel] || NIVEL_CONFIG.informativo;
                        const Icon = config.icon;
                        const canais = alerta.canais || [];

                        return (
                            <div
    key={alerta.id}
    onClick={() => navigate(`/alertas/${alerta.id}`)}
    className={`bg-white rounded-xl shadow border-l-4 ${config.border} overflow-hidden hover:shadow-md transition cursor-pointer`}
>
                                <div className="p-6">
                                    {/* Topo: ícone, título, badges */}
                                    <div className="flex items-start gap-4">
                                        <div className={`${config.bg} p-3 rounded-lg flex-shrink-0`}>
                                            <Icon className={`w-6 h-6 ${config.text}`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-lg">
                                                        {alerta.titulo}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span
                                                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${config.badge}`}
                                                        >
                                                            {config.label}
                                                        </span>
                                                        {alerta.tipo_risco_nome && (
                                                            <span className="text-xs text-gray-500">
                                                                {alerta.tipo_risco_nome}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {!alerta.cancelado && (
                                                    <button
    onClick={(e) => {
        e.stopPropagation();
        cancelarAlerta(alerta.id);
    }}
    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition"
    title="Cancelar alerta"
>
                                                        <X className="w-3.5 h-3.5" />
                                                        Cancelar
                                                    </button>
                                                )}
                                                {alerta.cancelado && (
                                                    <span className="text-xs text-gray-400 italic">
                                                        Cancelado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Mensagem */}
                                            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                                {alerta.mensagem}
                                            </p>

                                            {/* Meta info */}
                                            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatarData(alerta.data_emissao)}
                                                </div>

                                                {canais.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        {canais.map((canal) => {
                                                            const CanalIcon =
                                                                CANAIS_ICONS[canal] || Megaphone;
                                                            return (
                                                                <span
                                                                    key={canal}
                                                                    className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"
                                                                    title={canal}
                                                                >
                                                                    <CanalIcon className="w-3 h-3" />
                                                                    {canal}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {alerta.total_enviados > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {alerta.total_enviados.toLocaleString(
                                                            'pt-MZ'
                                                        )}{' '}
                                                        enviados
                                                    </div>
                                                )}

                                                {alerta.distritos_alvo &&
                                                    alerta.distritos_alvo.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {alerta.distritos_alvo.length} distrito(s)
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}