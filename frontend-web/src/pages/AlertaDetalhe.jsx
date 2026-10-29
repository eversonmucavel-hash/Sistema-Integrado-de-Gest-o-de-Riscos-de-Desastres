import Modal from '../components/Modal';
import EnviarSMSForm from '../components/forms/EnviarSMSForm';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    AlertCircle,
    AlertTriangle,
    Info,
    Bell,
    Radio,
    Smartphone,
    Megaphone,
    X,
    CheckCircle2,
    Clock,
    Users,
    Calendar,
    MapPin,
    MessageSquare,
    ListChecks,
    Activity,
    TrendingUp,
    Building2,
    RefreshCw,
    Send,
} from 'lucide-react';
import alertsService from '../services/alertsService';

const NIVEL_CONFIG = {
    informativo: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-500',
        icon: Info,
        label: 'Informativo',
    },
    atencao: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-500',
        icon: AlertTriangle,
        label: 'Atenção',
    },
    urgente: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-500',
        icon: AlertCircle,
        label: 'Urgente',
    },
    critico: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-500',
        icon: AlertCircle,
        label: 'Crítico',
    },
};

const CANAIS_ICONS = {
    SMS: Smartphone,
    APP: Bell,
    WEB: Megaphone,
    RADIO: Radio,
    EMAIL: Megaphone,
    USSD: Smartphone,
};

const formatarData = (dataISO) => {
    if (!dataISO) return '—';
    return new Date(dataISO).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function AlertaDetalhe() {
    const [disparando, setDisparando] = useState(false);

    const dispararAlerta = async () => {
        if (!alerta) return;

        const temAlvo =
            (alerta.distritos_alvo && alerta.distritos_alvo.length > 0) ||
            alerta.geometria;

        if (!temAlvo) {
            toast.error(
                'O alerta precisa ter distritos alvo ou geometria definidos'
            );
            return;
        }

        const ok = await confirmar({
            titulo: 'Disparar alerta',
            mensagem: `Vai enviar SMS para todos os cidadãos registados na zona afetada. Esta ação não pode ser revertida.`,
            textoConfirmar: 'Disparar agora',
            variante: 'danger',
        });

        if (!ok) return;

        setDisparando(true);
        try {
            const response = await alertsService.dispararAlerta(alerta.id);
            toast.success(
                `Envio iniciado. Aguarde alguns minutos.`
            );
            // Atualizar a página após 3 segundos para mostrar os envios
            setTimeout(() => loadData(), 3000);
        } catch (error) {
            console.error('Erro ao disparar:', error);
            const msg =
                error.response?.data?.erro ||
                'Erro ao disparar o alerta';
            toast.error(msg);
        } finally {
            setDisparando(false);
        }
    };    
    const [modalSMSAberto, setModalSMSAberto] = useState(false);
    const confirmar = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [alerta, setAlerta] = useState(null);
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const alertaRes = await alertsService.obterAlerta(id);
            setAlerta(alertaRes.data);

            // Se tem evento associado, carrega-o
            if (alertaRes.data.evento) {
                try {
                    const eventoRes = await alertsService.obterEvento(
                        alertaRes.data.evento
                    );
                    setEvento(eventoRes.data);
                } catch (e) {
                    console.warn('Evento não encontrado:', e);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar alerta:', error);
            setErro('Não foi possível carregar os dados deste alerta.');
        } finally {
            setLoading(false);
        }
    };

    const cancelarAlerta = async () => {
    const ok = await confirmar({
        titulo: 'Cancelar alerta',
        mensagem: 'Tens a certeza que queres cancelar este alerta? Esta ação não pode ser revertida.',
        textoConfirmar: 'Cancelar alerta',
        variante: 'danger',
    });
    if (!ok) return;

    setCancelando(true);
    try {
        await alertsService.cancelarAlerta(id);
        toast.success('Alerta cancelado com sucesso');
        await loadData();
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        toast.error('Erro ao cancelar o alerta');
    } finally {
        setCancelando(false);
    }
};
    if (erro || !alerta) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Alerta não encontrado'}</p>
                <button
                    onClick={() => navigate('/alertas')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    const config = NIVEL_CONFIG[alerta.nivel] || NIVEL_CONFIG.informativo;
    const Icon = config.icon;
    const canais = alerta.canais || [];
    const acoes = alerta.acoes_recomendadas || [];

    // Estatísticas de envio
    const totalDest = alerta.total_destinatarios || 0;
    const enviados = alerta.total_enviados || 0;
    const confirmados = alerta.total_confirmados || 0;
    const percEnviados = totalDest > 0 ? (enviados / totalDest) * 100 : 0;
    const percConfirmados = enviados > 0 ? (confirmados / enviados) * 100 : 0;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/alertas')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar aos alertas
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {alerta.titulo}
                        </h1>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${config.bg} ${config.text}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {config.label}
                            </span>
                            {alerta.tipo_risco_nome && (
                                <span className="text-sm text-gray-600">
                                    {alerta.tipo_risco_nome}
                                </span>
                            )}
                            {alerta.cancelado ? (
                                <span className="text-xs text-gray-400 italic">
                                    Cancelado em {formatarData(alerta.data_cancelamento)}
                                </span>
                            ) : (
                                <span className="text-xs text-green-600 font-medium">
                                    Ativo
                                </span>
                            )}
                        </div>
                    </div>

        {!alerta.cancelado && (
    <div className="flex items-center gap-2 flex-wrap">
        <button
            onClick={dispararAlerta}
            disabled={disparando}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 font-semibold"
        >
            <Bell className="w-4 h-4" />
            {disparando ? 'A disparar...' : 'Disparar Alerta'}
        </button>
        <button
            onClick={() => setModalSMSAberto(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
            <Send className="w-4 h-4" />
            Enviar SMS
        </button>
        <button
            onClick={cancelarAlerta}
            disabled={cancelando}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
            <X className="w-4 h-4" />
            {cancelando ? 'A cancelar...' : 'Cancelar'}
        </button>
    </div>
)}
                </div>
            </div>

            {/* Timeline / Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Calendar className="w-4 h-4" />
                        Emitido em
                    </div>
                    <p className="font-semibold text-gray-800">
                        {formatarData(alerta.data_emissao)}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="w-4 h-4" />
                        Válido até
                    </div>
                    <p className="font-semibold text-gray-800">
                        {formatarData(alerta.valido_ate)}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Prioridade
                    </div>
                    <p className="font-semibold text-gray-800">
                        Nível {alerta.prioridade || '—'}
                    </p>
                </div>
            </div>

            {/* Mensagem */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Mensagem</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{alerta.mensagem}</p>
            </div>

            {/* Ações Recomendadas */}
            {acoes.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <ListChecks className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Ações Recomendadas
                        </h2>
                    </div>
                    <ul className="space-y-2">
                        {acoes.map((acao, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{acao}</span>
                            </li>
                        ))}
                    </ul>
                    {alerta.areas_evacuacao && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">
                                <strong>Áreas de evacuação:</strong> {alerta.areas_evacuacao}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Grid: Distribuição + Estatísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Canais */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Megaphone className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Canais de Distribuição
                        </h2>
                    </div>

                    {canais.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum canal definido</p>
                    ) : (
                        <div className="space-y-3">
                            {canais.map((canal) => {
                                const CanalIcon = CANAIS_ICONS[canal] || Megaphone;
                                return (
                                    <div
                                        key={canal}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <CanalIcon className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-gray-800 flex-1">
                                            {canal}
                                        </span>
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Estatísticas */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Estatísticas de Envio
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Destinatários</span>
                                <span className="font-bold text-gray-800">
                                    {totalDest.toLocaleString('pt-MZ')}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Enviados</span>
                                <span className="font-bold text-blue-600">
                                    {enviados.toLocaleString('pt-MZ')} ({percEnviados.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${percEnviados}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Confirmados</span>
                                <span className="font-bold text-green-600">
                                    {confirmados.toLocaleString('pt-MZ')} (
                                    {percConfirmados.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${percConfirmados}%` }}
                                />
                            </div>
                        </div>

                        {alerta.total_envios !== undefined && (
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span>Registos de envio</span>
                                <span className="font-semibold">
                                    {alerta.total_envios}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Evento Associado */}
            {evento && (
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Evento Associado
                        </h2>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: `${evento.tipo_risco_cor || '#dc2626'}20`,
                            }}
                        >
                            <AlertTriangle
                                className="w-6 h-6"
                                style={{ color: evento.tipo_risco_cor || '#dc2626' }}
                            />
                        </div>
                        <div>
                            <p className="font-mono text-xs text-gray-500">
                                {evento.codigo_evento}
                            </p>
                            <h3 className="font-semibold text-gray-800 text-lg">
                                {evento.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                                    {evento.estado_resposta || '—'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
                                    Nível {evento.nivel_alerta || '—'}
                                </span>
                                {evento.ativo && (
                                    <span className="text-xs text-green-600 font-semibold">
                                        ATIVO
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {evento.descricao && (
                        <p className="text-sm text-gray-600 mb-4">{evento.descricao}</p>
                    )}

                    {/* Impacto */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-gray-500">Afetados</p>
                            <p className="font-bold text-red-700">
                                {(evento.pessoas_afetadas || 0).toLocaleString('pt-MZ')}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-gray-500">Deslocados</p>
                            <p className="font-bold text-orange-700">
                                {(evento.pessoas_deslocadas || 0).toLocaleString('pt-MZ')}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Mortes</p>
                            <p className="font-bold text-gray-800">{evento.mortes || 0}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-500">Habitações destruídas</p>
                            <p className="font-bold text-purple-700">
                                {(evento.habitacoes_destruidas || 0).toLocaleString('pt-MZ')}
                            </p>
                        </div>
                    </div>

                    {evento.coordenador_responsavel && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>
                                Coordenador:{' '}
                                <strong className="text-gray-700">
                                    {evento.coordenador_responsavel}
                                </strong>
                            </span>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/mapa')}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Ver evento no mapa →
                    </button>
                </div>
            )}

            {/* Sem evento */}
                       {/* Sem evento */}
            {!evento && (
                <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Este alerta não tem evento associado</p>
                </div>
            )}

            {/* Modal de envio de SMS */}
            <Modal
                isOpen={modalSMSAberto}
                onClose={() => setModalSMSAberto(false)}
                title="Enviar SMS"
                size="md"
            >
                <EnviarSMSForm
                    alertaId={alerta.id}
                    onSuccess={() => {
                        setModalSMSAberto(false);
                        loadData();
                    }}
                    onCancel={() => setModalSMSAberto(false)}
                />
            </Modal>
        </div>
    );
}