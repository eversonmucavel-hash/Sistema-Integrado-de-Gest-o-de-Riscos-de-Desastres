import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, MapPin, AlertTriangle, Bell, Home } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        provincias: 0,
        distritos: 0,
        areasRisco: 0,
        alertasAtivos: 0,
        abrigos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const fetchCount = async (url) => {
        try {
            const response = await api.get(url);
            const data = response.data;
            if (data && typeof data === 'object' && 'count' in data) {
                return data.count;
            }
            if (Array.isArray(data)) {
                return data.length;
            }
            return 0;
        } catch (error) {
            console.error(`Erro em ${url}:`, error.response?.status, error.message);
            setErrors((prev) => [...prev, `${url}: ${error.response?.status || error.message}`]);
            return 0;
        }
    };

    const loadStats = async () => {
        setErrors([]);
        const [prov, dist, areas, alertas, abrigos] = await Promise.all([
            fetchCount('/geography/provincias/'),
            fetchCount('/geography/distritos/'),
            fetchCount('/risks/areas-risco/'),           // ← CORRIGIDO
            fetchCount('/alerts/alertas/?ativo=true'),    // ← CORRIGIDO
            fetchCount('/shelters/abrigos/'),
        ]);

        setStats({
            provincias: prov,
            distritos: dist,
            areasRisco: areas,
            alertasAtivos: alertas,
            abrigos: abrigos,
        });
        setLoading(false);
    };

    const cards = [
        { label: 'Províncias', value: stats.provincias, icon: Building2, color: 'bg-blue-500' },
        { label: 'Distritos', value: stats.distritos, icon: MapPin, color: 'bg-green-500' },
        { label: 'Áreas de Risco', value: stats.areasRisco, icon: AlertTriangle, color: 'bg-orange-500' },
        { label: 'Alertas Ativos', value: stats.alertasAtivos, icon: Bell, color: 'bg-red-500' },
        { label: 'Abrigos', value: stats.abrigos, icon: Home, color: 'bg-purple-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {loading ? (
                <p className="text-gray-500">A carregar estatísticas...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} className="bg-white rounded-xl shadow p-6">
                                    <div className={`${card.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-gray-500">{card.label}</p>
                                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {errors.length > 0 && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="font-semibold text-yellow-800 mb-2">
                                Avisos ({errors.length}):
                            </p>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                {errors.map((err, i) => (
                                    <li key={i}>• {err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}