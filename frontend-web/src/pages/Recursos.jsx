
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import RecursoForm from '../components/forms/RecursoForm';
import { SkeletonCard, SkeletonStats } from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Plus,
    Filter,
    MapPin,
    Gift,
    Building2,
    Droplets,
    Utensils,
    Home,
    Shirt,
    Heart,
    Hammer,
    Pill,
    Layers,
} from 'lucide-react';
import resourcesService from '../services/resourcesService';
import risksService from '../services/risksService';

const STATUS_CONFIG = {
    disponivel: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Disponível',
    },
    alocado: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Alocado',
    },
    distribuido: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Distribuído',
    },
    expirado: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Expirado',
    },
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
    AGUA: 'bg-blue-100 text-blue-700',
    COMIDA: 'bg-orange-100 text-orange-700',
    KIT_HIGIENE: 'bg-pink-100 text-pink-700',
    COBERTOR: 'bg-purple-100 text-purple-700',
    LONA: 'bg-yellow-100 text-yellow-700',
    MEDICAMENTO: 'bg-red-100 text-red-700',
    ROUPA: 'bg-teal-100 text-teal-700',
    MATERIAL_CONSTRUCAO: 'bg-gray-200 text-gray-700',
};

function BarraDistribuicao({ disponivel, distribuida, total }) {
    if (!total || total === 0) return null;
    const percentagem = Math.min((distribuida / total) * 100, 100);

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Distribuição</span>
                <span className="font-semibold">{percentagem.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${percentagem}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                    {Number(distribuida).toLocaleString('pt-MZ')} distribuídos
                </span>
                <span>
                    {Number(disponivel).toLocaleString('pt-MZ')} disponíveis
                </span>
            </div>
        </div>
    );
}

export default function Recursos() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const [count, setCount] = useState(0);
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate();
    const [recursos, setRecursos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');

    useEffect(() => {
    loadData();
}, [page]);

    const loadData = async () => {
    try {
        const [recursosRes, categoriasRes, distritosRes] = await Promise.all([
            resourcesService.listarRecursos({ page }),
            resourcesService.listarCategorias(),
            risksService.listarDistritos(),
        ]);

        if (recursosRes.data.results) {
            setRecursos(recursosRes.data.results);
            setCount(recursosRes.data.count);
        } else {
            setRecursos(recursosRes.data);
            setCount(recursosRes.data.length);
        }

        setCategorias(categoriasRes.data.results || categoriasRes.data || []);
        setDistritos(distritosRes.data.results || distritosRes.data || []);
    } catch (error) {
        console.error('Erro ao carregar recursos:', error);
        setErro('Erro ao carregar recursos. Verifica o backend.');
    } finally {
        setLoading(false);
    }
};
    const recursosFiltrados = recursos.filter((r) => {
        const matchSearch =
            !search ||
            r.nome?.toLowerCase().includes(search.toLowerCase()) ||
            r.doador?.toLowerCase().includes(search.toLowerCase());

        const matchCategoria =
            !filtroCategoria || r.categoria === parseInt(filtroCategoria);
        const matchStatus = !filtroStatus || r.status === filtroStatus;
        const matchDistrito =
            !filtroDistrito || r.distrito === parseInt(filtroDistrito);

        return matchSearch && matchCategoria && matchStatus && matchDistrito;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroCategoria('');
        setFiltroStatus('');
        setFiltroDistrito('');
    };

    // Estatísticas
    const stats = {
        total: recursos.length,
        categorias: new Set(recursos.map((r) => r.categoria)).size,
        disponivel: recursos.reduce(
            (s, r) => s + Number(r.quantidade_disponivel || 0),
            0
        ),
        distribuida: recursos.reduce(
            (s, r) => s + Number(r.quantidade_distribuida || 0),
            0
        ),
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Recursos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {recursosFiltrados.length} de {recursos.length} recursos
                    </p>
                </div>
                <button
    onClick={() => setModalAberto(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
>
    <Plus className="w-4 h-4" />
    Novo Recurso
</button>
<Modal
    isOpen={modalAberto}
    onClose={() => setModalAberto(false)}
    title="Novo Recurso"
    size="lg"
>
    <RecursoForm
        onSuccess={(novoRecurso) => {
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
                        <Package className="w-4 h-4" />
                        Total de Recursos
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Layers className="w-4 h-4" />
                        Categorias
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.categorias}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Package className="w-4 h-4" />
                        Qtd. Disponível
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.disponivel.toLocaleString('pt-MZ')}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Gift className="w-4 h-4" />
                        Qtd. Distribuída
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.distribuida.toLocaleString('pt-MZ')}
                    </p>
                </div>
            </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold text-sm">Filtros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar recursos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todas as categorias</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os status</option>
                        <option value="disponivel">Disponível</option>
                        <option value="alocado">Alocado</option>
                        <option value="distribuido">Distribuído</option>
                        <option value="expirado">Expirado</option>
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
                {(search || filtroCategoria || filtroStatus || filtroDistrito) && (
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
) : recursosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {recursos.length === 0
                            ? 'Nenhum recurso registado'
                            : 'Nenhum recurso encontrado com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recursosFiltrados.map((recurso) => {
                        const statusConfig =
                            STATUS_CONFIG[recurso.status] || STATUS_CONFIG.disponivel;
                        const Icon =
                            CATEGORIA_ICONS[recurso.categoria_codigo] || Package;
                        const corCategoria =
                            CATEGORIA_CORES[recurso.categoria_codigo] ||
                            'bg-gray-100 text-gray-700';

                        const total =
                            Number(recurso.quantidade_disponivel || 0) +
                            Number(recurso.quantidade_distribuida || 0);

                        return (
                           <div
    key={recurso.id}
    onClick={() => navigate(`/recursos/${recurso.id}`)}
    className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden cursor-pointer"
>
                                <div className="p-5">
                                    {/* Topo */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`p-2.5 rounded-lg ${corCategoria}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 leading-tight">
                                                    {recurso.nome}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                                                    {recurso.categoria_nome && (
                                                        <span>{recurso.categoria_nome}</span>
                                                    )}
                                                    {recurso.unidade_medida && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{recurso.unidade_medida}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Quantidades */}
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">
                                                Disponível
                                            </p>
                                            <p className="font-bold text-green-600">
                                                {Number(
                                                    recurso.quantidade_disponivel || 0
                                                ).toLocaleString('pt-MZ')}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">
                                                Alocado
                                            </p>
                                            <p className="font-bold text-yellow-600">
                                                {Number(
                                                    recurso.quantidade_alocada || 0
                                                ).toLocaleString('pt-MZ')}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">
                                                Distribuído
                                            </p>
                                            <p className="font-bold text-blue-600">
                                                {Number(
                                                    recurso.quantidade_distribuida || 0
                                                ).toLocaleString('pt-MZ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Barra */}
                                    <BarraDistribuicao
                                        disponivel={recurso.quantidade_disponivel}
                                        distribuida={recurso.quantidade_distribuida}
                                        total={total}
                                    />

                                    {/* Info */}
                                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 flex-wrap">
                                        {recurso.distrito_nome && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {recurso.distrito_nome}
                                            </div>
                                        )}
                                        {recurso.doador && (
                                            <div className="flex items-center gap-1">
                                                <Gift className="w-3.5 h-3.5 text-gray-400" />
                                                {recurso.doador}
                                            </div>
                                        )}
                                        {recurso.tipo_doador && (
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                {recurso.tipo_doador}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Pagination
    count={count}
    page={page}
    pageSize={20}
    onChange={(novaPagina) => {
        setSearchParams({ page: novaPagina.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
/>
        </div>
    );
}