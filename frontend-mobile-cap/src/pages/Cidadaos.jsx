import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Plus, Filter, MapPin, Phone,
    AlertTriangle, UserCheck, Heart,
} from 'lucide-react';
import citizensService from '../services/citizensService';
import risksService from '../services/risksService';
import { SkeletonCard } from '../components/Skeleton';
import Modal from '../components/Modal';
import CidadaoForm from '../components/forms/CidadaoForm';

export default function Cidadaos() {
    const navigate = useNavigate();
    const [cidadaos, setCidadaos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [stats, setStats] = useState({ total: 0, ativos: 0, recebem_alertas: 0, vulneraveis: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroDistrito, setFiltroDistrito] = useState('');
    const [filtroVulneravel, setFiltroVulneravel] = useState('');
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => { carregar(); }, []);

    const carregar = async () => {
        try {
            const [c, d, s] = await Promise.all([
                citizensService.listarCidadaos(),
                risksService.listarDistritos(),
                citizensService.estatisticas(),
            ]);
            setCidadaos(c.data.results || c.data || []);
            setDistritos(d.data.results || d.data || []);
            setStats(s.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const cidadaosFiltrados = cidadaos.filter((c) => {
        const matchSearch = !search ||
            c.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
            c.telefone_principal?.includes(search);
        const matchDistrito = !filtroDistrito || c.distrito === parseInt(filtroDistrito);
        const matchVulneravel = !filtroVulneravel ||
            (filtroVulneravel === 'true' && c.pessoa_vulneravel) ||
            (filtroVulneravel === 'false' && !c.pessoa_vulneravel);
        return matchSearch && matchDistrito && matchVulneravel;
    });

    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return '—';
        const nasc = new Date(dataNasc);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return `${idade}a`;
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Cidadãos</h1>
                    <p className="text-xs text-gray-500">{cidadaosFiltrados.length} de {cidadaos.length}</p>
                </div>
                <button onClick={() => setModalAberto(true)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                    <Plus className="w-4 h-4" /> Novo
                </button>
            </div>

            {/* Estatísticas compactas */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg shadow p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Total</p>
                    <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Ativos</p>
                    <p className="text-xl font-bold text-green-600">{stats.ativos}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Recebem alertas</p>
                    <p className="text-xl font-bold text-blue-600">{stats.recebem_alertas}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Vulneráveis</p>
                    <p className="text-xl font-bold text-red-600">{stats.vulneraveis}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-3">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700">
                    <Filter className="w-3 h-3" /> Filtros
                </div>
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Nome ou telefone..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={filtroDistrito} onChange={(e) => setFiltroDistrito(e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
                            <option value="">Distrito</option>
                            {distritos.map((d) => (<option key={d.id} value={d.id}>{d.nome}</option>))}
                        </select>
                        <select value={filtroVulneravel} onChange={(e) => setFiltroVulneravel(e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
                            <option value="">Todos</option>
                            <option value="true">Vulneráveis</option>
                            <option value="false">Não vulneráveis</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de cards */}
            {loading ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
            ) : cidadaosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum cidadão encontrado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {cidadaosFiltrados.map((c) => (
                        <div key={c.id} onClick={() => navigate(`/cidadaos/${c.id}`)}
                            className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${c.sexo === 'F' ? 'bg-pink-100' : 'bg-blue-100'}`}>
                                    <Users className={`w-5 h-5 ${c.sexo === 'F' ? 'text-pink-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                                        {c.nome_completo}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{c.telefone_principal}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                            {calcularIdade(c.data_nascimento)}
                                        </span>
                                        {c.distrito_nome && (
                                            <span className="text-[10px] flex items-center gap-1 text-gray-600">
                                                <MapPin className="w-3 h-3" /> {c.distrito_nome}
                                            </span>
                                        )}
                                        {c.pessoa_vulneravel && (
                                            <span className="text-[10px] flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                                <AlertTriangle className="w-2.5 h-2.5" /> Vulnerável
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Novo Cidadão" size="lg">
                <CidadaoForm
                    onSuccess={() => { setModalAberto(false); carregar(); }}
                    onCancel={() => setModalAberto(false)}
                />
            </Modal>
        </div>
    );
}