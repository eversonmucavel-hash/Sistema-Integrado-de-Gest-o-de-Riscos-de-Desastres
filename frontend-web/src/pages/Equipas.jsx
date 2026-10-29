import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';
import { SkeletonCard, SkeletonStats } from '../components/Skeleton';
import Modal from '../components/Modal';
import EquipaForm from '../components/forms/EquipaForm';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    Filter,
    MapPin,
    Phone,
    Car,
    Building2,
    UserCheck,
    Activity,
    Clock,
} from 'lucide-react';
import teamsService from '../services/teamsService';

const STATUS_CONFIG = {
    standby: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Standby',
        dot: 'bg-blue-500',
    },
    em_missao: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Em Missão',
        dot: 'bg-green-500',
    },
    descansando: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'A Descansar',
        dot: 'bg-yellow-500',
    },
    indisponivel: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Indisponível',
        dot: 'bg-gray-500',
    },
};

export default function Equipas() {
    
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate();
    const [equipas, setEquipas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [equipasRes, tiposRes] = await Promise.all([
                teamsService.listarEquipas(),
                teamsService.listarTipos(),
            ]);

            setEquipas(equipasRes.data.results || equipasRes.data || []);
            setTipos(tiposRes.data.results || tiposRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar equipas:', error);
            setErro('Erro ao carregar equipas. Verifica o backend.');
        } finally {
            setLoading(false);
        }
    };

    const equipasFiltradas = equipas.filter((e) => {
        const matchSearch =
            !search ||
            e.nome?.toLowerCase().includes(search.toLowerCase()) ||
            e.instituicao?.toLowerCase().includes(search.toLowerCase()) ||
            e.lider_nome?.toLowerCase().includes(search.toLowerCase());

        const matchTipo = !filtroTipo || e.tipo_equipa === parseInt(filtroTipo);
        const matchStatus = !filtroStatus || e.status === filtroStatus;

        return matchSearch && matchTipo && matchStatus;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroTipo('');
        setFiltroStatus('');
    };

    // Estatísticas
    const stats = {
        total: equipas.length,
        membros: equipas.reduce((s, e) => s + (e.numero_membros || 0), 0),
        standby: equipas.filter((e) => e.status === 'standby').length,
        emMissao: equipas.filter((e) => e.status === 'em_missao').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Equipas de Resposta
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {equipasFiltradas.length} de {equipas.length} equipas
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
    title="Nova Equipa"
    size="lg"
>
    <EquipaForm
        onSuccess={() => {
            setModalAberto(false);
            loadData();
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

            {/* Estatísticas */}

            {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Users className="w-4 h-4" />
                        Total de Equipas
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <UserCheck className="w-4 h-4" />
                        Total de Membros
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stats.membros}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="w-4 h-4" />
                        Em Standby
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.standby}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Activity className="w-4 h-4" />
                        Em Missão
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.emMissao}</p>
                </div>
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
                            placeholder="Buscar equipas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os tipos</option>
                        {tipos.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os status</option>
                        <option value="standby">Standby</option>
                        <option value="em_missao">Em Missão</option>
                        <option value="descansando">A Descansar</option>
                        <option value="indisponivel">Indisponível</option>
                    </select>
                </div>
                {(search || filtroTipo || filtroStatus) && (
                    <button
                        onClick={limparFiltros}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Lista */}
            {loading ? (
    <>
        <SkeletonStats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    </>
) : equipasFiltradas.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {equipas.length === 0
                            ? 'Nenhuma equipa registada'
                            : 'Nenhuma equipa encontrada com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {equipasFiltradas.map((equipa) => {
                        const statusConfig =
                            STATUS_CONFIG[equipa.status] || STATUS_CONFIG.indisponivel;

                        return (
                            <div
    key={equipa.id}
    onClick={() => navigate(`/equipas/${equipa.id}`)}
    className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden cursor-pointer"
>
                                <div className="p-5">
                                    {/* Topo */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-100 p-2.5 rounded-lg">
                                                <Users className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 leading-tight">
                                                    {equipa.nome}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="font-mono">
                                                        {equipa.codigo_equipa}
                                                    </span>
                                                    {equipa.tipo_equipa_nome && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{equipa.tipo_equipa_nome}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                                            />
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Info grid */}
                                    <div className="space-y-2 mt-3 text-sm">
                                        {equipa.instituicao && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    Instituição:
                                                </span>
                                                <span className="font-medium">
                                                    {equipa.instituicao}
                                                </span>
                                            </div>
                                        )}

                                        {equipa.lider_nome && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <UserCheck className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    Líder:
                                                </span>
                                                <span className="font-medium">
                                                    {equipa.lider_nome}
                                                </span>
                                                {equipa.lider_telefone && (
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {equipa.lider_telefone}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {equipa.latitude && equipa.longitude && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    Localização:
                                                </span>
                                                <span className="font-mono text-xs">
                                                    {Number(equipa.latitude).toFixed(4)},{' '}
                                                    {Number(equipa.longitude).toFixed(4)}
                                                </span>
                                            </div>
                                        )}

                                        {equipa.veiculo && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Car className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    Veículo:
                                                </span>
                                                <span className="font-medium">
                                                    {equipa.veiculo}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rodapé: membros + capacidade */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-semibold text-gray-700">
                                                    {equipa.numero_membros || 0}
                                                </span>
                                                <span className="text-gray-500">membros</span>
                                            </div>
                                            {equipa.capacidade_atendimento && (
                                                <div className="flex items-center gap-1">
                                                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-gray-500">Cap.:</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {equipa.capacidade_atendimento}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => navigate('/mapa')}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Ver no mapa →
                                        </button>
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