
import Modal from '../components/Modal';
import AbrigoForm from '../components/forms/AbrigoForm';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard, SkeletonStats } from '../components/Skeleton';
import { useState, useEffect } from 'react';
import {
    Home,
    Search,
    Plus,
    Filter,
    MapPin,
    Users,
    Droplets,
    Zap,
    ShowerHead,
    Utensils,
    Phone,
    Heart,
    Building2,
} from 'lucide-react';
import sheltersService from '../services/sheltersService';
import risksService from '../services/risksService';

const STATUS_CONFIG = {
    aberto: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Aberto',
    },
    lotado: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Lotado',
    },
    fechado: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Fechado',
    },
    em_preparacao: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Em preparação',
    },
};

function BarraOcupacao({ ocupacao, capacidade }) {
    const percentagem = capacidade > 0 ? Math.min((ocupacao / capacidade) * 100, 100) : 0;

    let cor = 'bg-green-500';
    if (percentagem >= 90) cor = 'bg-red-500';
    else if (percentagem >= 70) cor = 'bg-orange-500';
    else if (percentagem >= 40) cor = 'bg-yellow-500';

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Ocupação</span>
                <span className="font-semibold">{percentagem.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${cor} transition-all duration-500`}
                    style={{ width: `${percentagem}%` }}
                />
            </div>
        </div>
    );
}

export default function Abrigos() {
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate();
    const [abrigos, setAbrigos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [abrigosRes, distritosRes] = await Promise.all([
                sheltersService.listarAbrigos(),
                risksService.listarDistritos(),
            ]);

            setAbrigos(abrigosRes.data.results || abrigosRes.data || []);
            setDistritos(distritosRes.data.results || distritosRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar abrigos:', error);
            setErro('Erro ao carregar abrigos. Verifica o backend.');
        } finally {
            setLoading(false);
        }
    };

    const abrigosFiltrados = abrigos.filter((a) => {
        const matchSearch =
            !search ||
            a.nome?.toLowerCase().includes(search.toLowerCase()) ||
            a.endereco?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = !filtroStatus || a.status === filtroStatus;
        const matchDistrito = !filtroDistrito || a.distrito === parseInt(filtroDistrito);

        return matchSearch && matchStatus && matchDistrito;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroStatus('');
        setFiltroDistrito('');
    };

    // Estatísticas
    const stats = {
        total: abrigos.length,
        capacidade: abrigos.reduce((s, a) => s + (a.capacidade_maxima || 0), 0),
        ocupados: abrigos.reduce((s, a) => s + (a.ocupacao_atual || 0), 0),
        percentagem:
            abrigos.length > 0
                ? Math.round(
                      (abrigos.reduce((s, a) => s + (a.ocupacao_atual || 0), 0) /
                          Math.max(
                              abrigos.reduce((s, a) => s + (a.capacidade_maxima || 0), 0),
                              1
                          )) *
                          100
                  )
                : 0,
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Abrigos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {abrigosFiltrados.length} de {abrigos.length} abrigos
                    </p>
                </div>
                <button
    onClick={() => setModalAberto(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
>
    <Plus className="w-4 h-4" />
    Novo Abrigo
</button>
            </div>
            <Modal
    isOpen={modalAberto}
    onClose={() => setModalAberto(false)}
    title="Novo Abrigo"
    size="lg"
>
    <AbrigoForm
        onSuccess={() => {
            setModalAberto(false);
            loadData();
        }}
        onCancel={() => setModalAberto(false)}
    />
</Modal>

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
                        <Home className="w-4 h-4" />
                        Total de Abrigos
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Users className="w-4 h-4" />
                        Capacidade Total
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.capacidade.toLocaleString('pt-MZ')}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Building2 className="w-4 h-4" />
                        Pessoas Alojadas
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.ocupados.toLocaleString('pt-MZ')}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Heart className="w-4 h-4" />
                        Ocupação Global
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.percentagem}%</p>
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
                            placeholder="Buscar abrigos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os estados</option>
                        <option value="aberto">Aberto</option>
                        <option value="lotado">Lotado</option>
                        <option value="em_preparacao">Em preparação</option>
                        <option value="fechado">Fechado</option>
                    </select>

                    <select
                        value={filtroDistrito}
                        onChange={(e) => setFiltroDistrito(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os distritos</option>
                        {distritos.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.nome}
                            </option>
                        ))}
                    </select>
                </div>
                {(search || filtroStatus || filtroDistrito) && (
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
) : abrigosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {abrigos.length === 0
                            ? 'Nenhum abrigo registado'
                            : 'Nenhum abrigo encontrado com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {abrigosFiltrados.map((abrigo) => {
                        const statusConfig =
                            STATUS_CONFIG[abrigo.status] || STATUS_CONFIG.fechado;
                        const disponiveis =
                            (abrigo.capacidade_maxima || 0) - (abrigo.ocupacao_atual || 0);

                        return (
                            <div
                                key={abrigo.id}
                                onClick={() => navigate(`/abrigos/${abrigo.id}`)}
                                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
                            >
                                <div className="p-5">
                                    {/* Topo */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-purple-100 p-2.5 rounded-lg">
                                                <Home className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 leading-tight">
                                                    {abrigo.nome}
                                                </h3>
                                                {abrigo.distrito_nome && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {abrigo.distrito_nome}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Contagens */}
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Capacidade</p>
                                            <p className="font-bold text-gray-800">
                                                {abrigo.capacidade_maxima || 0}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Ocupados</p>
                                            <p className="font-bold text-blue-600">
                                                {abrigo.ocupacao_atual || 0}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Disponíveis</p>
                                            <p
                                                className={`font-bold ${
                                                    disponiveis > 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {disponiveis}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Barra de ocupação */}
                                    <BarraOcupacao
                                        ocupacao={abrigo.ocupacao_atual || 0}
                                        capacidade={abrigo.capacidade_maxima || 1}
                                    />

                                    {/* Recursos / Infraestrutura */}
                                    <div className="flex items-center gap-3 mt-4 text-xs text-gray-600 flex-wrap">
                                        {abrigo.tem_agua && (
                                            <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                                <Droplets className="w-3 h-3 text-blue-500" />
                                                Água
                                            </span>
                                        )}
                                        {abrigo.tem_energia && (
                                            <span className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                                <Zap className="w-3 h-3 text-yellow-600" />
                                                Energia
                                            </span>
                                        )}
                                        {abrigo.tem_saneamento && (
                                            <span className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded">
                                                <ShowerHead className="w-3 h-3 text-cyan-600" />
                                                Saneamento
                                            </span>
                                        )}
                                        {abrigo.tem_cozinha && (
                                            <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                                                <Utensils className="w-3 h-3 text-orange-600" />
                                                Cozinha
                                            </span>
                                        )}
                                    </div>

                                    {/* Contacto */}
                                    {abrigo.telefone_contacto && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                            <Phone className="w-3 h-3" />
                                            <span>
                                                {abrigo.responsavel || 'Responsável'}:{' '}
                                                <span className="font-mono">
                                                    {abrigo.telefone_contacto}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}