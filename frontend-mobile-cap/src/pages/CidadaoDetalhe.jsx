import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    AlertTriangle,
    Heart,
    MessageSquare,
    Activity,
} from 'lucide-react';
import citizensService from '../services/citizensService';

const VULNERABILIDADE_LABEL = {
    idoso: 'Idoso',
    crianca: 'Criança',
    gestante: 'Gestante',
    deficiente: 'Pessoa com deficiência',
    doente_cronico: 'Doente crónico',
};

export default function CidadaoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cidadao, setCidadao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        carregar();
    }, [id]);

    const carregar = async () => {
        try {
            const res = await citizensService.obterCidadao(id);
            setCidadao(res.data);
        } catch (error) {
            console.error('Erro ao carregar cidadão:', error);
            setErro('Não foi possível carregar os dados deste cidadão.');
        } finally {
            setLoading(false);
        }
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

    const formatarData = (dataISO) => {
        if (!dataISO) return '—';
        return new Date(dataISO).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">A carregar cidadão...</p>
            </div>
        );
    }

    if (erro || !cidadao) {
        return (
            <div className="bg-white rounded-xl shadow p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{erro || 'Cidadão não encontrado'}</p>
                <button
                    onClick={() => navigate('/cidadaos')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar à lista
                </button>
            </div>
        );
    }

    // Determinar cor do avatar
    const avatarCor = cidadao.sexo === 'F' ? 'bg-pink-100' : 'bg-blue-100';
    const avatarCorTexto = cidadao.sexo === 'F' ? 'text-pink-600' : 'text-blue-600';

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/cidadaos')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar aos cidadãos
                </button>

                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`${avatarCor} p-4 rounded-xl`}>
                            <User className={`w-8 h-8 ${avatarCorTexto}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {cidadao.nome_completo}
                            </h1>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {cidadao.ativo ? (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-800">
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-700">
                                        Inativo
                                    </span>
                                )}
                                {cidadao.pessoa_vulneravel && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800">
                                        <AlertTriangle className="w-3 h-3" />
                                        Vulnerável
                                    </span>
                                )}
                                {cidadao.receber_alertas && (
                                    <span className="text-xs text-blue-600 font-medium">
                                        Recebe alertas
                                    </span>
                                )}
                            </div>
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
                {/* Informação Pessoal */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Informação Pessoal
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">
                                Data nascimento
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                                {formatarData(cidadao.data_nascimento)}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Idade</span>
                            <span className="text-sm font-medium text-gray-800">
                                {calcularIdade(cidadao.data_nascimento)}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Sexo</span>
                            <span className="text-sm font-medium text-gray-800">
                                {cidadao.sexo === 'M'
                                    ? 'Masculino'
                                    : cidadao.sexo === 'F'
                                    ? 'Feminino'
                                    : '—'}
                            </span>
                        </div>
                        {cidadao.documento_identificacao && (
                            <div className="flex items-center gap-3 py-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Documento
                                </span>
                                <span className="text-sm font-medium text-gray-800 font-mono">
                                    {cidadao.documento_identificacao}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contactos */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Contactos
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Telefone</span>
                            <span className="text-sm font-mono font-medium text-gray-800">
                                {cidadao.telefone_principal}
                            </span>
                        </div>
                        {cidadao.telefone_alternativo && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">
                                    Alternativo
                                </span>
                                <span className="text-sm font-mono font-medium text-gray-800">
                                    {cidadao.telefone_alternativo}
                                </span>
                            </div>
                        )}
                        {cidadao.email && (
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Email</span>
                                <span className="text-sm text-gray-800">
                                    {cidadao.email}
                                </span>
                            </div>
                        )}

                        <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-2">
                                Canais preferidos
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(cidadao.canais_preferidos || []).map((canal) => (
                                    <span
                                        key={canal}
                                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                    >
                                        {canal}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Localização</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Distrito</p>
                        <p className="font-medium text-gray-800">
                            {cidadao.distrito_nome || '—'}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Endereço</p>
                        <p className="font-medium text-gray-800">
                            {cidadao.endereco || '—'}
                        </p>
                    </div>
                    {cidadao.latitude && cidadao.longitude && (
                        <>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Latitude</p>
                                <p className="font-mono text-sm text-gray-800">
                                    {Number(cidadao.latitude).toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Longitude</p>
                                <p className="font-mono text-sm text-gray-800">
                                    {Number(cidadao.longitude).toFixed(6)}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Vulnerabilidades */}
            {cidadao.pessoa_vulneravel && (
                <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Vulnerabilidades
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {(cidadao.tipo_vulnerabilidade || []).map((v) => (
                            <span
                                key={v}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700"
                            >
                                {VULNERABILIDADE_LABEL[v] || v}
                            </span>
                        ))}
                    </div>

                    {cidadao.necessidades_especiais && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                            <p className="text-xs text-red-700 font-semibold mb-1">
                                Necessidades especiais
                            </p>
                            <p className="text-sm text-red-800">
                                {cidadao.necessidades_especiais}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Informação de Registo</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Data de registo</p>
                        <p className="text-gray-800">
                            {formatarData(cidadao.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Origem</p>
                        <p className="text-gray-800 capitalize">
                            {cidadao.origem_registo || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Validado</p>
                        <p className="text-gray-800">
                            {cidadao.validado ? 'Sim' : 'Não'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}