import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    MapPin,
    Users,
    Home,
    School,
    Heart,
    AlertTriangle,
    Calendar,
    Database,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import risksService from '../services/risksService';
import MapaRisco from '../components/MapaRisco';


const NIVEL_CORES = {
    baixo: 'bg-green-100 text-green-800 border-green-300',
    medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    alto: 'bg-orange-100 text-orange-800 border-orange-300',
    critico: 'bg-red-100 text-red-800 border-red-300',
};

const NIVEL_LABEL = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
};

const IMPACTO_LABEL = {
    minimo: 'Mínimo',
    moderado: 'Moderado',
    grave: 'Grave',
    catastrofico: 'Catastrófico',
};

const PROBABILIDADE_LABEL = {
    rara: 'Rara',
    possivel: 'Possível',
    provavel: 'Provável',
    certa: 'Certa',
};

export default function RiscoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        loadArea();
    }, [id]);

    const loadArea = async () => {
        try {
            const response = await risksService.obterArea(id);
            setArea(response.data);
        } catch (error) {
            console.error('Erro ao carregar área:', error);
            setErro('Não foi possível carregar os dados desta área de risco.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">A carregar...</p>
            </div>
        );
    }

    if (erro || !area) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Área não encontrada'}</p>
                <button
                    onClick={() => navigate('/riscos')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    const infoItems = [
        {
            icon: MapPin,
            label: 'Distrito',
            value: area.distrito_nome || '—',
        },
        {
            icon: Users,
            label: 'População exposta',
            value: (area.populacao_exposta || 0).toLocaleString('pt-MZ'),
        },
        {
            icon: Users,
            label: 'Famílias expostas',
            value: (area.familias_expostas || 0).toLocaleString('pt-MZ'),
        },
        {
            icon: AlertTriangle,
            label: 'Probabilidade',
            value: PROBABILIDADE_LABEL[area.probabilidade] || area.probabilidade || '—',
        },
        {
            icon: AlertTriangle,
            label: 'Impacto',
            value: IMPACTO_LABEL[area.impacto] || area.impacto || '—',
        },
        {
            icon: Database,
            label: 'Fonte de dados',
            value: area.fonte_dados || '—',
        },
    ];

    const infraItems = [
        {
            icon: School,
            label: 'Escolas em risco',
            value: area.escolas_em_risco || 0,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: Heart,
            label: 'Centros de saúde',
            value: area.centros_saude_em_risco || 0,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            icon: Home,
            label: 'Habitações em risco',
            value: area.habitacoes_em_risco || 0,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/riscos')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar às áreas de risco
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {area.nome_area}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                    NIVEL_CORES[area.nivel_risco] || 'bg-gray-100'
                                }`}
                            >
                                {NIVEL_LABEL[area.nivel_risco] || area.nivel_risco}
                            </span>
                            <span className="text-sm text-gray-600">
                                {area.tipo_risco_nome || '—'}
                            </span>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                        Editar
                    </button>
                </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Informações */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Informação Geral
                    </h2>
                    <div className="space-y-3">
                        {infoItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Icon className="w-4 h-4 text-gray-400" />
                                        {item.label}
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm">
                                        {item.value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Infraestruturas */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Infraestruturas em Risco
                    </h2>
                    <div className="space-y-3">
                        {infraItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${item.bg}`}
                                >
                                    <div className={`${item.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">{item.label}</p>
                                    </div>
                                    <p className={`text-xl font-bold ${item.color}`}>
                                        {item.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Localização Geográfica
                </h2>
                <MapaRisco
                    geometria={area.geometria}
                    nivel={area.nivel_risco}
                    nome={area.nome_area}
                />
            </div>

            {/* Descrição */}
            {area.descricao && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Descrição
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {area.descricao}
                    </p>
                </div>
            )}
        </div>
    );
}