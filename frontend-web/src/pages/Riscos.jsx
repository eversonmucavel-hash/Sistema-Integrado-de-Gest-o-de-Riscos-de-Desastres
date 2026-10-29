import { SkeletonTable } from '../components/Skeleton';
import Modal from '../components/Modal';
import AreaRiscoForm from '../components/forms/AreaRiscoForm';
import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Search,
    Plus,
    Filter,
    MapPin,
    Users,
} from 'lucide-react';
import risksService from '../services/risksService';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const NIVEL_CORES = {
    baixo: 'bg-green-100 text-green-800 border-green-200',
    medio: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alto: 'bg-orange-100 text-orange-800 border-orange-200',
    critico: 'bg-red-100 text-red-800 border-red-200',
};

const NIVEL_LABEL = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
};

export default function Riscos() {
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate(); 
    const [areas, setAreas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [areasRes, tiposRes, distritosRes] = await Promise.all([
                risksService.listarAreas(),
                risksService.listarTipos(),
                risksService.listarDistritos(),
            ]);

            setAreas(areasRes.data.results || areasRes.data);
            setTipos(tiposRes.data.results || tiposRes.data);
            setDistritos(distritosRes.data.results || distritosRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtragem local
    const areasFiltradas = areas.filter((area) => {
        const matchSearch =
            !search ||
            area.nome_area?.toLowerCase().includes(search.toLowerCase()) ||
            area.descricao?.toLowerCase().includes(search.toLowerCase());

        const matchNivel = !filtroNivel || area.nivel_risco === filtroNivel;
        const matchTipo = !filtroTipo || area.tipo_risco === parseInt(filtroTipo);
        const matchDistrito = !filtroDistrito || area.distrito === parseInt(filtroDistrito);

        return matchSearch && matchNivel && matchTipo && matchDistrito;
    });

    const limparFiltros = () => {
        setSearch('');
        setFiltroNivel('');
        setFiltroTipo('');
        setFiltroDistrito('');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Áreas de Risco</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {areasFiltradas.length} de {areas.length} áreas
                    </p>
                </div>
                <button
    onClick={() => setModalAberto(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
>
    <Plus className="w-4 h-4" />
    Nova Área
</button>

<Modal
    isOpen={modalAberto}
    onClose={() => setModalAberto(false)}
    title="Nova Área de Risco"
    size="xl"
>
    <AreaRiscoForm
        onSuccess={() => {
            setModalAberto(false);
            loadData();
        }}
        onCancel={() => setModalAberto(false)}
    />
</Modal>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold text-sm">Filtros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Buscar */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Nível */}
                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Todos os níveis</option>
                        <option value="baixo">Baixo</option>
                        <option value="medio">Médio</option>
                        <option value="alto">Alto</option>
                        <option value="critico">Crítico</option>
                    </select>

                    {/* Tipo */}
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

                    {/* Distrito */}
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
                {(search || filtroNivel || filtroTipo || filtroDistrito) && (
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
    <SkeletonTable rows={6} />
) : areasFiltradas.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {areas.length === 0
                            ? 'Nenhuma área de risco registada'
                            : 'Nenhuma área encontrada com os filtros aplicados'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Nome
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Tipo
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Nível
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Distrito
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                                    Pop. Exposta
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {areasFiltradas.map((area) => (
                                <tr
                             key={area.id}
    onClick={() => navigate(`/riscos/${area.id}`)}
    className="hover:bg-gray-50 transition cursor-pointer"
>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-lg">
                                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {area.nome_area}
                                                </p>
                                                {area.descricao && (
                                                    <p className="text-xs text-gray-500 truncate max-w-md">
                                                        {area.descricao}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700">
                                            {area.tipo_risco_nome || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                NIVEL_CORES[area.nivel_risco] || 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {NIVEL_LABEL[area.nivel_risco] || area.nivel_risco}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {area.distrito_nome || '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            {(area.populacao_exposta || 0).toLocaleString('pt-MZ')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}