import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Plus, Filter, MapPin, Users } from 'lucide-react';
import risksService from '../services/risksService';
import Modal from '../components/Modal';
import AreaRiscoForm from '../components/forms/AreaRiscoForm';
import { SkeletonCard } from '../components/Skeleton';

const NIVEL_CORES = {
    baixo: 'bg-green-100 text-green-800 border-green-200',
    medio: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alto: 'bg-orange-100 text-orange-800 border-orange-200',
    critico: 'bg-red-100 text-red-800 border-red-200',
};

const NIVEL_LABEL = {
    baixo: 'Baixo', medio: 'Médio', alto: 'Alto', critico: 'Crítico',
};

export default function Riscos() {
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => { carregar(); }, []);

    const carregar = async () => {
        try {
            const [a, t, d] = await Promise.all([
                risksService.listarAreas(),
                risksService.listarTipos(),
                risksService.listarDistritos(),
            ]);
            setAreas(a.data.results || a.data || []);
            setTipos(t.data.results || t.data || []);
            setDistritos(d.data.results || d.data || []);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const areasFiltradas = areas.filter((area) => {
        const matchSearch = !search || area.nome_area?.toLowerCase().includes(search.toLowerCase());
        const matchNivel = !filtroNivel || area.nivel_risco === filtroNivel;
        const matchTipo = !filtroTipo || area.tipo_risco === parseInt(filtroTipo);
        const matchDistrito = !filtroDistrito || area.distrito === parseInt(filtroDistrito);
        return matchSearch && matchNivel && matchTipo && matchDistrito;
    });

    const limparFiltros = () => {
        setSearch(''); setFiltroNivel(''); setFiltroTipo(''); setFiltroDistrito('');
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Áreas de Risco</h1>
                    <p className="text-xs text-gray-500">{areasFiltradas.length} de {areas.length}</p>
                </div>
                <button onClick={() => setModalAberto(true)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm">
                    <Plus className="w-4 h-4" /> Nova
                </button>
            </div>

            {/* Filtros (compactos para mobile) */}
            <div className="bg-white rounded-xl shadow p-3 mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700 text-xs font-semibold">
                    <Filter className="w-3 h-3" /> Filtros
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Buscar..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
                            <option value="">Nível</option>
                            <option value="baixo">Baixo</option>
                            <option value="medio">Médio</option>
                            <option value="alto">Alto</option>
                            <option value="critico">Crítico</option>
                        </select>
                        <select value={filtroDistrito} onChange={(e) => setFiltroDistrito(e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
                            <option value="">Distrito</option>
                            {distritos.map((d) => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                        </select>
                    </div>
                </div>
                {(search || filtroNivel || filtroTipo || filtroDistrito) && (
                    <button onClick={limparFiltros} className="mt-2 text-xs text-blue-600 font-medium">
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Lista de cards (mobile-first) */}
            {loading ? (
                <div className="space-y-3">
                    <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
                </div>
            ) : areasFiltradas.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhuma área encontrada.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {areasFiltradas.map((area) => (
                        <div key={area.id} onClick={() => navigate(`/riscos/${area.id}`)}
                            className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                        {area.nome_area}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">{area.tipo_risco_nome}</p>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${NIVEL_CORES[area.nivel_risco] || 'bg-gray-100 text-gray-800'}`}>
                                    {NIVEL_LABEL[area.nivel_risco] || area.nivel_risco}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {area.distrito_nome || '—'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {(area.populacao_exposta || 0).toLocaleString('pt-MZ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de criação */}
            <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Nova Área" size="lg">
                <AreaRiscoForm
                    onSuccess={() => { setModalAberto(false); carregar(); }}
                    onCancel={() => setModalAberto(false)}
                />
            </Modal>
        </div>
    );
}