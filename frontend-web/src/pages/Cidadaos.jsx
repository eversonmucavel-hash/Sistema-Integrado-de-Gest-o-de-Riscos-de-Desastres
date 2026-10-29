import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    Filter,
    MapPin,
    Phone,
    AlertTriangle,
    UserCheck,
    UserX,
    Heart,
} from 'lucide-react';
import citizensService from '../services/citizensService';
import risksService from '../services/risksService';
import { SkeletonCard, SkeletonStats } from '../components/Skeleton';
import Modal from '../components/Modal';
import CidadaoForm from '../components/forms/CidadaoForm';

export default function Cidadaos() {
    const navigate = useNavigate();
    const [cidadaos, setCidadaos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        ativos: 0,
        recebem_alertas: 0,
        vulneraveis: 0,
    });
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');
    const [filtroVulneravel, setFiltroVulneravel] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('true');
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => {
        carregarTudo();
    }, []);

    const carregarTudo = async () => {
        try {
            const [cidadaosRes, distritosRes, statsRes] = await Promise.all([
                citizensService.listarCidadaos(),
                risksService.listarDistritos(),
                citizensService.estatisticas(),
            ]);

            setCidadaos(cidadaosRes.data.results || cidadaosRes.data || []);
            setDistritos(distritosRes.data.results || distritosRes.data || []);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Erro ao carregar cidadãos:', error);
            setErro('Erro ao carregar cidadãos. Verifica o backend.');
        } finally {
            setLoading(false);
        }
    };

    const cidadaosFiltrados = cidadaos.filter((c) => {
        const matchSearch =
            !search ||
            c.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
            c.telefone_principal?.includes(search);

        const matchDistrito =
            !filtroDistrito || c.distrito === parseInt(filtroDistrito);
        const matchVulneravel =
            !filtroVulneravel ||
            (filtroVulneravel === 'true' && c.pessoa_vulneravel) ||
            (filtroVulneravel === 'false' && !c.pessoa_vulneravel);
        const matchAtivo =
            !filtroAtivo ||
            (filtroAtivo === 'true' && c.ativo) ||
            (filtroAtivo === 'false' && !c.ativo);

        return matchSearch && matchDistrito && matchVulneravel && matchAtivo;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroDistrito('');
        setFiltroVulneravel('');
        setFiltroAtivo('true');
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

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cidadãos Registados</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {cidadaosFiltrados.length} de {cidadaos.length} cidadãos
                    </p>
                </div>
                <button
                    onClick={() => setModalAberto(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus className="w-4 h-4" />
                    Novo Cidadão
                </button>
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
                            Total
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <UserCheck className="w-4 h-4" />
                            Ativos
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Phone className="w-4 h-4" />
                            Recebem alertas
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats.recebem_alertas}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Heart className="w-4 h-4" />
                            Vulneráveis
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {stats.vulneraveis}
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
                            placeholder="Buscar nome ou telefone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

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

                    <select
                        value={filtroVulneravel}
                        onChange={(e) => setFiltroVulneravel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Vulnerabilidade</option>
                        <option value="true">Apenas vulneráveis</option>
                        <option value="false">Apenas não vulneráveis</option>
                    </select>

                    <select
                        value={filtroAtivo}
                        onChange={(e) => setFiltroAtivo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="true">Apenas ativos</option>
                        <option value="false">Apenas inativos</option>
                        <option value="">Todos</option>
                    </select>
                </div>
                {(search || filtroDistrito || filtroVulneravel || filtroAtivo !== 'true') && (
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
            ) : cidadaosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {cidadaos.length === 0
                            ? 'Nenhum cidadão registado'
                            : 'Nenhum cidadão encontrado com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Nome
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Telefone
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Distrito
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Idade
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Vulnerável
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cidadaosFiltrados.slice(0, 50).map((c) => (
                                <tr
                                    key={c.id}
                                    onClick={() => navigate(`/cidadaos/${c.id}`)}
                                    className="hover:bg-gray-50 transition cursor-pointer"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Users className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {c.nome_completo}
                                                </p>
                                                {c.endereco && (
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {c.endereco}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                                        {c.telefone_principal}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-700">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            {c.distrito_nome || '—'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {calcularIdade(c.data_nascimento)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {c.pessoa_vulneravel ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                                                <AlertTriangle className="w-3 h-3" />
                                                Sim
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {c.ativo ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-semibold">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {cidadaosFiltrados.length > 50 && (
                        <div className="p-4 text-center text-xs text-gray-500 bg-gray-50">
                            A mostrar os primeiros 50 de {cidadaosFiltrados.length} cidadãos
                        </div>
                    )}
                </div>
            )}

            {/* Modal de criação */}
            <Modal
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                title="Novo Cidadão"
                size="lg"
            >
                <CidadaoForm
                    onSuccess={() => {
                        setModalAberto(false);
                        carregarTudo();
                    }}
                    onCancel={() => setModalAberto(false)}
                />
            </Modal>
        </div>
    );
}