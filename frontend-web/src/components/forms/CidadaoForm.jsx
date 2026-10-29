import { useState, useEffect } from 'react';
import { Save, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import citizensService from '../../services/citizensService';
import risksService from '../../services/risksService';

const VULNERABILIDADES = [
    { codigo: 'idoso', label: 'Idoso' },
    { codigo: 'crianca', label: 'Criança' },
    { codigo: 'gestante', label: 'Gestante' },
    { codigo: 'deficiente', label: 'Pessoa com deficiência' },
    { codigo: 'doente_cronico', label: 'Doente crónico' },
];

export default function CidadaoForm({ onSuccess, onCancel }) {
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        nome_completo: '',
        data_nascimento: '',
        sexo: '',
        documento_identificacao: '',
        telefone_principal: '',
        telefone_alternativo: '',
        email: '',
        distrito: '',
        endereco: '',
        latitude: '',
        longitude: '',
        receber_alertas: true,
        canais_preferidos: ['SMS'],
        idioma_preferido: 'pt',
        pessoa_vulneravel: false,
        tipo_vulnerabilidade: [],
        necessidades_especiais: '',
        ativo: true,
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
            setErro('Erro ao carregar distritos.');
        } finally {
            setLoadingData(false);
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

    const toggleCanal = (canal) => {
        setForm((prev) => ({
            ...prev,
            canais_preferidos: prev.canais_preferidos.includes(canal)
                ? prev.canais_preferidos.filter((c) => c !== canal)
                : [...prev.canais_preferidos, canal],
        }));
    };

    const toggleVulnerabilidade = (codigo) => {
        setForm((prev) => ({
            ...prev,
            tipo_vulnerabilidade: prev.tipo_vulnerabilidade.includes(codigo)
                ? prev.tipo_vulnerabilidade.filter((v) => v !== codigo)
                : [...prev.tipo_vulnerabilidade, codigo],
        }));
    };

    const validar = () => {
        const novosErros = {};

        if (!form.nome_completo.trim()) {
            novosErros.nome_completo = 'Nome é obrigatório';
        }
        if (!form.telefone_principal.trim()) {
            novosErros.telefone_principal = 'Telefone é obrigatório';
        } else if (
            !form.telefone_principal.startsWith('+258') &&
            !form.telefone_principal.startsWith('258')
        ) {
            novosErros.telefone_principal = 'Deve começar com +258 (Moçambique)';
        }

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
            receber_alertas: form.receber_alertas,
            canais_preferidos: form.canais_preferidos,
            idioma_preferido: form.idioma_preferido || 'pt',
            pessoa_vulneravel: form.pessoa_vulneravel,
            tipo_vulnerabilidade: form.tipo_vulnerabilidade,
            ativo: form.ativo,
        };

        if (form.data_nascimento) payload.data_nascimento = form.data_nascimento;
        if (form.sexo) payload.sexo = form.sexo;
        if (form.documento_identificacao.trim())
            payload.documento_identificacao = form.documento_identificacao.trim();
        if (form.telefone_alternativo.trim())
            payload.telefone_alternativo = form.telefone_alternativo.trim();
        if (form.email.trim()) payload.email = form.email.trim();
        if (form.distrito) payload.distrito = Number(form.distrito);
        if (form.endereco.trim()) payload.endereco = form.endereco.trim();
        if (form.latitude) payload.latitude = Number(form.latitude);
        if (form.longitude) payload.longitude = Number(form.longitude);
        if (form.necessidades_especiais.trim())
            payload.necessidades_especiais = form.necessidades_especiais.trim();

        try {
            const response = await citizensService.criarCidadao(payload);
            toast.success('Cidadão registado com sucesso');
            onSuccess(response.data);
        } catch (error) {
            console.error('Erro ao criar cidadão:', error);
            const dados = error.response?.data;
            if (dados && typeof dados === 'object') {
                const primeiro = Object.entries(dados)[0];
                const msg = `${primeiro[0]}: ${primeiro[1]}`;
                setErro(msg);
                toast.error(msg);
            } else {
                setErro('Erro ao criar o cidadão.');
                toast.error('Erro ao criar o cidadão');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">A carregar dados...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {erro}
                </div>
            )}

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

            {/* Data nascimento + Sexo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de nascimento
                    </label>
                    <input
                        type="date"
                        name="data_nascimento"
                        value={form.data_nascimento}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexo
                    </label>
                    <select
                        name="sexo"
                        value={form.sexo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">—</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                </div>
            </div>

            {/* Telefone + Alternativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone principal <span className="text-red-500">*</span>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone alternativo
                    </label>
                    <input
                        type="tel"
                        name="telefone_alternativo"
                        value={form.telefone_alternativo}
                        onChange={handleChange}
                        placeholder="+258840000000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="exemplo@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Distrito + Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distrito
                    </label>
                    <select
                        name="distrito"
                        value={form.distrito}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Selecione...</option>
                        {distritos.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.nome}
                            </option>
                        ))}
                    </select>
                </div>
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
            </div>

            {/* Coordenadas GPS */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Coordenadas GPS (opcional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        step="0.00000001"
                        placeholder="Latitude"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <input
                        type="number"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        step="0.00000001"
                        placeholder="Longitude"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                </div>
            </div>

            {/* Canais preferidos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canais preferidos
                </label>
                <div className="flex flex-wrap gap-2">
                    {['SMS', 'APP', 'EMAIL', 'RADIO'].map((canal) => (
                        <button
                            key={canal}
                            type="button"
                            onClick={() => toggleCanal(canal)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                form.canais_preferidos.includes(canal)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {canal}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vulnerabilidade */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 mb-3">
                    <input
                        type="checkbox"
                        name="pessoa_vulneravel"
                        checked={form.pessoa_vulneravel}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Pessoa vulnerável
                </label>

                {form.pessoa_vulneravel && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {VULNERABILIDADES.map((v) => (
                            <label
                                key={v.codigo}
                                className="flex items-center gap-2 cursor-pointer text-xs text-gray-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={form.tipo_vulnerabilidade.includes(v.codigo)}
                                    onChange={() => toggleVulnerabilidade(v.codigo)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                {v.label}
                            </label>
                        ))}
                    </div>
                )}

                {form.pessoa_vulneravel && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Necessidades especiais
                        </label>
                        <textarea
                            name="necessidades_especiais"
                            value={form.necessidades_especiais}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Ex: Precisa de medicamentos diários"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Receber alertas + Ativo */}
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="receber_alertas"
                        checked={form.receber_alertas}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Receber alertas por SMS
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="ativo"
                        checked={form.ativo}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Cidadão ativo
                </label>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {loading ? 'A guardar...' : 'Registar Cidadão'}
                </button>
            </div>
        </form>
    );
}