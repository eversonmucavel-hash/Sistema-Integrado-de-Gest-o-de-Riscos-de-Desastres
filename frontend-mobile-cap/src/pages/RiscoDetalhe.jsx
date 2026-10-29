import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, MapPin, Users, Home, School, Heart,
    AlertTriangle, Calendar, Database,
} from 'lucide-react';
import risksService from '../services/risksService';
import MapaRisco from '../components/MapaRisco';

const NIVEL_CORES = {
    baixo: 'bg-green-100 text-green-800 border-green-300',
    medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    alto: 'bg-orange-100 text-orange-800 border-orange-300',
    critico: 'bg-red-100 text-red-800 border-red-300',
};
const NIVEL_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto', critico: 'Crítico' };
const IMPACTO_LABEL = { minimo: 'Mínimo', moderado: 'Moderado', grave: 'Grave', catastrofico: 'Catastrófico' };
const PROBABILIDADE_LABEL = { rara: 'Rara', possivel: 'Possível', provavel: 'Provável', certa: 'Certa' };

export default function RiscoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => { carregar(); }, [id]);

    const carregar = async () => {
        try {
            const r = await risksService.obterArea(id);
            setArea(r.data);
        } catch (e) {
            console.error(e);
            setErro('Não foi possível carregar os dados.');
        } finally { setLoading(false); }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">A carregar...</div>;
    if (erro || !area) return <div className="p-8 text-center text-red-500">{erro || 'Área não encontrada'}</div>;

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <button onClick={() => navigate('/riscos')}
                className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-800 leading-tight">{area.nome_area}</h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${NIVEL_CORES[area.nivel_risco]}`}>
                            {NIVEL_LABEL[area.nivel_risco]}
                        </span>
                        <span className="text-xs text-gray-500">{area.tipo_risco_nome}</span>
                    </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                    <Edit className="w-4 h-4" />
                </button>
            </div>

            {/* Info essencial (compacta) */}
            <div className="bg-white rounded-xl shadow p-4 space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" /> Distrito
                    </div>
                    <span className="text-sm font-medium text-gray-800">{area.distrito_nome || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" /> População
                    </div>
                    <span className="text-sm font-medium text-gray-800">{(area.populacao_exposta || 0).toLocaleString('pt-MZ')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 text-gray-400" /> Probabilidade
                    </div>
                    <span className="text-sm font-medium text-gray-800">{PROBABILIDADE_LABEL[area.probabilidade] || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Database className="w-4 h-4 text-gray-400" /> Impacto
                    </div>
                    <span className="text-sm font-medium text-gray-800">{IMPACTO_LABEL[area.impacto] || '—'}</span>
                </div>
            </div>

            {/* Infraestruturas em risco (3 mini-cards lado a lado) */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <School className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{area.escolas_em_risco || 0}</p>
                    <p className="text-[10px] text-gray-500">Escolas</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                    <Heart className="w-4 h-4 mx-auto text-red-600 mb-1" />
                    <p className="text-lg font-bold text-red-700">{area.centros_saude_em_risco || 0}</p>
                    <p className="text-[10px] text-gray-500">Saúde</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <Home className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-700">{area.habitacoes_em_risco || 0}</p>
                    <p className="text-[10px] text-gray-500">Habitações</p>
                </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-xl shadow p-3">
                <h2 className="text-sm font-bold text-gray-800 mb-2">Localização</h2>
                <div className="rounded-lg overflow-hidden" style={{ height: '250px' }}>
                    <MapaRisco
                        geometria={area.geometria}
                        nivel={area.nivel_risco}
                        nome={area.nome_area}
                    />
                </div>
            </div>
        </div>
    );
}