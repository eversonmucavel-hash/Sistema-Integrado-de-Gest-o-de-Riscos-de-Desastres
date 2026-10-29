import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldAlert,
    User,
    Phone,
    MapPin,
    CheckCircle2,
    Loader2,
    Heart,
    ArrowLeft,
} from 'lucide-react';
import citizensService from '../services/citizensService';
import risksService from '../services/risksService';

const VULNERABILIDADES = [
    { codigo: 'idoso', label: 'Idoso' },
    { codigo: 'crianca', label: 'Criança' },
    { codigo: 'gestante', label: 'Gestante' },
    { codigo: 'deficiente', label: 'Pessoa com deficiência' },
    { codigo: 'doente_cronico', label: 'Doente crónico' },
];

export default function RegistoPublico() {
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        nome_completo: '',
        telefone_principal: '',
        distrito: '',
        endereco: '',
        latitude: '',
        longitude: '',
        pessoa_vulneravel: false,
        tipo_vulnerabilidade: [],
        canais_preferidos: ['SMS'],
    });

    useEffect(() => {
        carregarDistritos();
    }, []);

    const carregarDistritos = async () => {
        try {
            const res = await risksService.listarDistritos();
            setDistritos(res.data.results || res.data || []);
        } catch (error) {
            console.error('Erro ao carregar distritos:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (erros[name]) {
            setErros((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const toggleVulnerabilidade = (codigo) => {
        setForm((prev) => ({
            ...prev,
            tipo_vulnerabilidade: prev.tipo_vulnerabilidade.includes(codigo)
                ? prev.tipo_vulnerabilidade.filter((v) => v !== codigo)
                : [...prev.tipo_vulnerabilidade, codigo],
        }));
    };

    const usarLocalizacaoAtual = () => {
        if (!navigator.geolocation) {
            setErro('Geolocalização não suportada pelo navegador');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                }));
            },
            (err) => {
                console.error('Erro de geolocalização:', err);
                setErro('Não foi possível obter a localização');
            }
        );
    };

    const validar = () => {
        const novosErros = {};
        if (!form.nome_completo.trim()) novosErros.nome_completo = 'Nome é obrigatório';
        if (!form.telefone_principal.trim()) {
            novosErros.telefone_principal = 'Telefone é obrigatório';
        } else if (!form.telefone_principal.startsWith('+258')) {
            novosErros.telefone_principal = 'Deve começar com +258';
        }
        if (!form.distrito) novosErros.distrito = 'Distrito é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (!validar()) return;

        setLoading(true);

        const payload = {
            nome_completo: form.nome_completo.trim(),
            telefone_principal: form.telefone_principal.trim(),
            distrito: Number(form.distrito),
            canais_preferidos: form.canais_preferidos,
            pessoa_vulneravel: form.pessoa_vulneravel,
            tipo_vulnerabilidade: form.tipo_vulnerabilidade,
        };

        if (form.endereco.trim()) payload.endereco = form.endereco.trim();
        if (form.latitude) payload.latitude = Number(form.latitude);
        if (form.longitude) payload.longitude = Number(form.longitude);

        try {
            await citizensService.registarPublico(payload);
            setSucesso(true);
        } catch (error) {
            console.error('Erro ao registar:', error);
            const dados = error.response?.data;
            if (dados && typeof dados === 'object') {
                const primeiro = Object.entries(dados)[0];
                setErro(`${primeiro[0]}: ${primeiro[1]}`);
            } else {
                setErro('Erro ao efetuar o registo. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (sucesso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-800 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Registo efetuado
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Vai receber alertas de desastres naturais por SMS no número{' '}
                        <strong>{form.telefone_principal}</strong>.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                        Ir para o sistema
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-800 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <ShieldAlert className="w-10 h-10 text-blue-900" />
                        <h1 className="text-3xl font-bold text-blue-900">SIGRD</h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Sistema Integrado de Gestão de Riscos de Desastres
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Moçambique</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800">
                        Registe-se gratuitamente para receber <strong>alertas por SMS</strong>{' '}
                        quando houver risco de desastres naturais na sua zona.
                    </p>
                </div>

                {erro && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nome_completo"
                            value={form.nome_completo}
                            onChange={handleChange}
                            placeholder="Ex: Maria da Silva"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                erros.nome_completo ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        {erros.nome_completo && (
                            <p className="text-xs text-red-600 mt-1">{erros.nome_completo}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="telefone_principal"
                            value={form.telefone_principal}
                            onChange={handleChange}
                            placeholder="+258840000000"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono ${
                                erros.telefone_principal ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        {erros.telefone_principal && (
                            <p className="text-xs text-red-600 mt-1">
                                {erros.telefone_principal}
                            </p>
                        )}
                    </div>

                    {/* Distrito */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Distrito <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="distrito"
                            value={form.distrito}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                erros.distrito ? 'border-red-400' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Selecione...</option>
                            {distritos.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.nome}
                                </option>
                            ))}
                        </select>
                        {erros.distrito && (
                            <p className="text-xs text-red-600 mt-1">{erros.distrito}</p>
                        )}
                    </div>

                    {/* Endereço */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço / Bairro
                        </label>
                        <input
                            type="text"
                            name="endereco"
                            value={form.endereco}
                            onChange={handleChange}
                            placeholder="Ex: Bairro Macúti"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Localização GPS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Localização (opcional)
                        </label>
                        <button
                            type="button"
                            onClick={usarLocalizacaoAtual}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                        >
                            <MapPin className="w-4 h-4" />
                            Usar localização atual
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                name="latitude"
                                value={form.latitude}
                                onChange={handleChange}
                                step="0.00000001"
                                placeholder="Latitude"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            />
                            <input
                                type="number"
                                name="longitude"
                                value={form.longitude}
                                onChange={handleChange}
                                step="0.00000001"
                                placeholder="Longitude"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            />
                        </div>
                    </div>

                    {/* Vulnerabilidade */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                name="pessoa_vulneravel"
                                checked={form.pessoa_vulneravel}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <Heart className="w-4 h-4 text-red-500" />
                            Sou pessoa vulnerável
                        </label>

                        {form.pessoa_vulneravel && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {VULNERABILIDADES.map((v) => (
                                    <label
                                        key={v.codigo}
                                        className="flex items-center gap-2 cursor-pointer text-xs text-gray-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.tipo_vulnerabilidade.includes(v.codigo)}
                                            onChange={() => toggleVulnerabilidade(v.codigo)}
                                            className="w-3.5 h-3.5 text-blue-600 rounded"
                                        />
                                        {v.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5" />
                        )}
                        {loading ? 'A registar...' : 'Registar-me'}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Os seus dados serão usados apenas para enviar alertas de emergência.
                    </p>
                </form>
            </div>
        </div>
    );
}