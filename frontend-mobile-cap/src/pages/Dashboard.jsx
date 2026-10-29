import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, MapPin, AlertTriangle, Bell, Home, RefreshCw,
    PlusCircle, Map, ShieldCheck, TrendingUp, Calendar, User
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        provincias: 0, distritos: 0, areasRisco: 0, alertasAtivos: 0, abrigos: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { carregar(); }, []);

    const carregar = async () => {
        setLoading(true);
        try {
            const [p, d, a, al, ab] = await Promise.all([
                api.get('/geography/provincias/'),
                api.get('/geography/distritos/'),
                api.get('/risks/areas-risco/'),
                api.get('/alerts/alertas/'),
                api.get('/shelters/abrigos/'),
            ]);
            const cnt = (r) => r.data.results ? r.data.count : r.data.length;
            const alertasAtivos = al.data.results
                ? al.data.results.filter(x => !x.cancelado).length
                : al.data.filter(x => !x.cancelado).length;
            setStats({
                provincias: cnt(p), distritos: cnt(d), areasRisco: cnt(a),
                alertasAtivos, abrigos: cnt(ab),
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { label: 'Províncias', value: stats.provincias, icon: Building2, color: 'bg-blue-500', trend: '+0', trendColor: 'text-green-600' },
        { label: 'Distritos', value: stats.distritos, icon: MapPin, color: 'bg-green-500', trend: '+0', trendColor: 'text-green-600' },
        { label: 'Áreas de Risco', value: stats.areasRisco, icon: AlertTriangle, color: 'bg-orange-500', trend: 'Estável', trendColor: 'text-gray-500' },
        { label: 'Alertas Ativos', value: stats.alertasAtivos, icon: Bell, color: 'bg-red-500', trend: 'Atenção', trendColor: 'text-red-600 font-bold' },
        { label: 'Abrigos', value: stats.abrigos, icon: Home, color: 'bg-purple-500', trend: 'OK', trendColor: 'text-green-600' },
    ];

    const dataAtual = new Date().toLocaleDateString('pt-PT', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <div className="p-4 space-y-6">
            {/* Cabeçalho de Boas-Vindas */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Olá, {user?.nome_completo?.split(' ')[0] || 'Utilizador'} 👋
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    {dataAtual}
                </div>
            </div>

            {/* KPI Cards Compactos */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Resumo Nacional
                    </h2>
                    <button onClick={carregar} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="bg-white rounded-xl shadow p-3 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <div className={`${card.color} text-white w-9 h-9 rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-semibold ${card.trendColor}`}>
                                        {card.trend}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold">{card.label}</p>
                                    <p className="text-xl font-bold text-gray-800 leading-tight">{card.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ações Rápidas */}
            <div>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/alertas')}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-3 flex items-center gap-2 transition"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Novo Alerta</span>
                    </button>
                    <button
                        onClick={() => navigate('/mapa')}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 flex items-center gap-2 transition"
                    >
                        <Map className="w-5 h-5" />
                        <span className="text-sm font-medium">Ver Mapa</span>
                    </button>
                    <button
                        onClick={() => navigate('/abrigos')}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-3 flex items-center gap-2 transition"
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-sm font-medium">Abrigos</span>
                    </button>
                    <button
                        onClick={() => navigate('/riscos')}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-3 flex items-center gap-2 transition"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Riscos</span>
                    </button>
                </div>
            </div>

            {/* Status do Sistema (Rodapé) */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-green-800">Sistema Operacional</p>
                    <p className="text-[10px] text-green-600">Todos os serviços a funcionar</p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
        </div>
    );
}