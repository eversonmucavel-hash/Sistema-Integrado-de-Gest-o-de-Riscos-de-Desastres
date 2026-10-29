import { useState, useEffect } from 'react';
import {
    Building2,
    MapPin,
    AlertTriangle,
    Bell,
    Home,
    RefreshCw,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const CORES_NIVEL = {
    baixo: '#16a34a',
    medio: '#eab308',
    alto: '#f97316',
    critico: '#dc2626',
};

const CORES_TIPO = [
    '#dc2626',
    '#2563eb',
    '#f59e0b',
    '#f97316',
    '#8b5cf6',
    '#10b981',
    '#6366f1',
];

const NIVEL_LABEL = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
};

const STATUS_ABRIGO_CORES = {
    aberto: '#16a34a',
    lotado: '#dc2626',
    fechado: '#6b7280',
    em_preparacao: '#f59e0b',
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [stats, setStats] = useState({
        provincias: 0,
        distritos: 0,
        areasRisco: 0,
        alertasAtivos: 0,
        abrigos: 0,
    });

    // Dados para gráficos
    const [areasPorNivel, setAreasPorNivel] = useState([]);
    const [areasPorTipo, setAreasPorTipo] = useState([]);
    const [topDistritos, setTopDistritos] = useState([]);
    const [abrigosPorStatus, setAbrigosPorStatus] = useState([]);
    const [alertasPorNivel, setAlertasPorNivel] = useState([]);
    const [ocupacaoAbrigos, setOcupacaoAbrigos] = useState([]);

    useEffect(() => {
        // Pequeno atraso para garantir que o token JWT já está carregado
        const timer = setTimeout(() => {
            carregarTudo();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Função auxiliar para extrair arrays (seja paginado ou não)
    const getData = (res) => {
        if (!res || !res.data) return [];
        return Array.isArray(res.data) ? res.data : (res.data.results || []);
    };

    const carregarTudo = async () => {
        setLoading(true);
        setErro(null);

        try {
            // Chamadas individuais para não bloquear o dashboard inteiro
            const resProv = await api.get('/geography/provincias/');
            const resDist = await api.get('/geography/distritos/');
            const resAreas = await api.get('/risks/areas-risco/');
            const resAlertas = await api.get('/alerts/alertas/');
            const resAbrigos = await api.get('/shelters/abrigos/');
            
            // Tenta buscar os tipos de risco, mas se falhar, não cancela o resto
            let tipos = [];
            try {
                const resTipos = await api.get('/risks/tipos-risco/');
                tipos = getData(resTipos);
            } catch (e) {
                console.warn("Aviso: Não foi possível carregar os tipos de risco.", e.message);
            }

            // Tratamento de dados
            const provinciasList = getData(resProv);
            const distritosList = getData(resDist);
            const areas = getData(resAreas);
            const alertas = getData(resAlertas);
            const abrigosList = getData(resAbrigos);

            // === 1. Atualizar KPIs ===
            setStats({
                provincias: provinciasList.length,
                distritos: distritosList.length,
                areasRisco: areas.length,
                alertasAtivos: alertas.filter((a) => !a.cancelado).length,
                abrigos: abrigosList.length,
            });

            // === 2. Gráfico: Áreas por nível ===
            const niveis = { baixo: 0, medio: 0, alto: 0, critico: 0 };
            areas.forEach((a) => {
                if (a.nivel_risco && niveis[a.nivel_risco] !== undefined) {
                    niveis[a.nivel_risco]++;
                }
            });
            setAreasPorNivel(
                Object.entries(niveis).map(([nivel, total]) => ({
                    nivel: NIVEL_LABEL[nivel] || nivel,
                    total,
                    cor: CORES_NIVEL[nivel],
                }))
            );

            // === 3. Gráfico: Áreas por tipo de risco ===
            const contagemTipo = {};
            areas.forEach((a) => {
                const tipoId = a.tipo_risco;
                if (!contagemTipo[tipoId]) contagemTipo[tipoId] = 0;
                contagemTipo[tipoId]++;
            });
            const dadosTipo = Object.entries(contagemTipo).map(([tipoId, total]) => {
                const tipo = tipos.find((t) => t.id === parseInt(tipoId));
                return {
                    nome: tipo?.nome || `Tipo ${tipoId}`,
                    total,
                };
            });
            setAreasPorTipo(dadosTipo);

            // === 4. Gráfico: Top 5 distritos com mais áreas de risco ===
            const contagemDistrito = {};
            areas.forEach((a) => {
                const dId = a.distrito;
                if (!contagemDistrito[dId]) contagemDistrito[dId] = 0;
                contagemDistrito[dId]++;
            });
            const topDist = Object.entries(contagemDistrito)
                .map(([dId, total]) => {
                    const dist = distritosList.find((d) => d.id === parseInt(dId));
                    return {
                        nome: dist?.nome || `Distrito ${dId}`,
                        total,
                    };
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            setTopDistritos(topDist);

            // === 5. Gráfico: Abrigos por status ===
            const porStatus = {};
            abrigosList.forEach((a) => {
                const s = a.status || 'desconhecido';
                if (!porStatus[s]) porStatus[s] = 0;
                porStatus[s]++;
            });
            const dadosStatus = Object.entries(porStatus).map(([status, total]) => ({
                nome: status,
                total,
                cor: STATUS_ABRIGO_CORES[status] || '#9ca3af',
            }));
            setAbrigosPorStatus(dadosStatus);

            // === 6. Gráfico: Alertas por nível ===
            const porNivel = {};
            alertas.forEach((al) => {
                const n = al.nivel || 'informativo';
                if (!porNivel[n]) porNivel[n] = 0;
                porNivel[n]++;
            });
            const dadosAlertas = [
                'informativo',
                'atencao',
                'urgente',
                'critico',
            ].map((n) => ({
                nivel: n,
                total: porNivel[n] || 0,
            }));
            setAlertasPorNivel(dadosAlertas);

            // === 7. Gráfico: Ocupação por abrigo ===
            const ocupacao = abrigosList
                .filter((a) => a.capacidade_maxima > 0)
                .map((a) => ({
                    nome: a.nome.length > 20 ? a.nome.substring(0, 20) + '…' : a.nome,
                    ocupacao: a.ocupacao_atual || 0,
                    disponivel: Math.max(0, (a.capacidade_maxima || 0) - (a.ocupacao_atual || 0)) || 0,
                }))
                .slice(0, 6);
            setOcupacaoAbrigos(ocupacao);

        } catch (error) {
            console.error('=== ERRO NO DASHBOARD ===');
            console.error('Mensagem:', error.message);
            console.error('Status:', error.response?.status);
            console.error('URL:', error.config?.url);
            console.error('========================');
            setErro(`Erro ao carregar dados: ${error.response?.status || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { label: 'Províncias', value: stats.provincias, icon: Building2, color: 'bg-blue-500' },
        { label: 'Distritos', value: stats.distritos, icon: MapPin, color: 'bg-green-500' },
        { label: 'Áreas de Risco', value: stats.areasRisco, icon: AlertTriangle, color: 'bg-orange-500' },
        { label: 'Alertas Ativos', value: stats.alertasAtivos, icon: Bell, color: 'bg-red-500' },
        { label: 'Abrigos', value: stats.abrigos, icon: Home, color: 'bg-purple-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">A carregar dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={carregarTudo}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">
                    {erro}
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-xl shadow p-6">
                            <div
                                className={`${card.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                            >
                                <Icon className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Gráficos - linha 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Áreas por nível */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Áreas de Risco por Nível
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={areasPorNivel}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="nivel" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {areasPorNivel.map((entry, index) => (
                                    <Cell key={index} fill={entry.cor} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Áreas por tipo */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Distribuição por Tipo de Risco
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={areasPorTipo}
                                dataKey="total"
                                nameKey="nome"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label={({ nome, total }) => `${nome}: ${total}`}
                                labelLine={false}
                            >
                                {areasPorTipo.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={CORES_TIPO[index % CORES_TIPO.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráficos - linha 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top 5 distritos */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Top 5 Distritos com Mais Áreas de Risco
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={topDistritos}
                            layout="vertical"
                            margin={{ left: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                            <YAxis
                                dataKey="nome"
                                type="category"
                                tick={{ fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="total" fill="#dc2626" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Abrigos por status */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Abrigos por Estado
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={abrigosPorStatus}
                                dataKey="total"
                                nameKey="nome"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                label={({ nome, total }) => `${nome}: ${total}`}
                                labelLine={false}
                            >
                                {abrigosPorStatus.map((entry, index) => (
                                    <Cell key={index} fill={entry.cor} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráficos - linha 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertas por nível */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Alertas por Nível
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={alertasPorNivel}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="nivel" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {alertasPorNivel.map((entry, index) => {
                                    const cores = {
                                        informativo: '#2563eb',
                                        atencao: '#eab308',
                                        urgente: '#f97316',
                                        critico: '#dc2626',
                                    };
                                    return (
                                        <Cell key={index} fill={cores[entry.nivel]} />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Ocupação de abrigos */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Ocupação de Abrigos
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={ocupacaoAbrigos}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="nome"
                                tick={{ fontSize: 11 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    fontSize: 12,
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                dataKey="ocupacao"
                                stackId="a"
                                fill="#3b82f6"
                                radius={[0, 0, 0, 0]}
                                name="Ocupados"
                            />
                            <Bar
                                dataKey="disponivel"
                                stackId="a"
                                fill="#cbd5e1"
                                radius={[6, 6, 0, 0]}
                                name="Disponíveis"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}