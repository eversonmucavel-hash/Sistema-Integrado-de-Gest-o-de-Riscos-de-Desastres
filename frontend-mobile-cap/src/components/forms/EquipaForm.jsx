import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Save, Loader2, MapPin } from 'lucide-react';
import teamsService from '../../services/teamsService';
import risksService from '../../services/risksService';

export default function EquipaForm({ onSuccess, onCancel }) {
    const [tipos, setTipos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        codigo_equipa: '',
        nome: '',
        tipo_equipa: '',
        instituicao: '',
        lider_nome: '',
        lider_telefone: '',
        numero_membros: 5,
        distrito_atuacao: '',
        veiculo: '',
        capacidade_atendimento: '',
        status: 'standby',
        missao_atual: '',
        latitude: '',
        longitude: '',
        ativo: true,
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [tiposRes, distritosRes] = await Promise.all([
                teamsService.listarTipos(),
                risksService.listarDistritos(),
            ]);
            setTipos(tiposRes.data.results || tiposRes.data || []);
            setDistritos(distritosRes.data.results || distritosRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar tipos de equipa e distritos.');
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

    const gerarCodigo = () => {
        const ano = new Date().getFullYear();
        const num = Math.floor(Math.random() * 900) + 100;
        setForm((prev) => ({
            ...prev,
            codigo_equipa: `EQ-${ano}-${num}`,
        }));
    };

    const validar = () => {
        const novosErros = {};

        if (!form.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!form.codigo_equipa.trim())
            novosErros.codigo_equipa = 'Código é obrigatório';
        if (!form.tipo_equipa) novosErros.tipo_equipa = 'Tipo é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (!validar()) return;

        setLoading(true);

        const payload = {
            codigo_equipa: form.codigo_equipa.trim(),
            nome: form.nome.trim(),
            tipo_equipa: Number(form.tipo_equipa),
            status: form.status,
            ativo: form.ativo,
        };

        if (form.instituicao.trim()) payload.instituicao = form.instituicao.trim();
        if (form.lider_nome.trim()) payload.lider_nome = form.lider_nome.trim();
        if (form.lider_telefone.trim())
            payload.lider_telefone = form.lider_telefone.trim();
        if (form.numero_membros) payload.numero_membros = Number(form.numero_membros);
        if (form.distrito_atuacao)
            payload.distrito_atuacao = Number(form.distrito_atuacao);
        if (form.veiculo.trim()) payload.veiculo = form.veiculo.trim();
        if (form.capacidade_atendimento)
            payload.capacidade_atendimento = Number(form.capacidade_atendimento);
        if (form.missao_atual.trim()) payload.missao_atual = form.missao_atual.trim();
        if (form.latitude) payload.latitude = Number(form.latitude);
        if (form.longitude) payload.longitude = Number(form.longitude);

        try {
    const response = await sheltersService.criarEquipe(payload);
    toast.success('Equipe criado com sucesso');
    onSuccess(response.data);
} catch (error) {
    console.error('Erro ao criar equipe:', error);
    const dados = error.response?.data;
    if (dados && typeof dados === 'object') {
        const primeiro = Object.entries(dados)[0];
        setErro(`${primeiro[0]}: ${primeiro[1]}`);
    } else {
        setErro('Erro ao criar o equipe.');
    }
    toast.error('Erro ao criar o equipe');
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
                    Nome <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Ex: Equipa INGD - Beira"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.nome ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.nome && (
                    <p className="text-xs text-red-600 mt-1">{erros.nome}</p>
                )}
            </div>

            {/* Codigo + Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="codigo_equipa"
                            value={form.codigo_equipa}
                            onChange={handleChange}
                            placeholder="EQ-2026-001"
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                erros.codigo_equipa ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={gerarCodigo}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                        >
                            Gerar
                        </button>
                    </div>
                    {erros.codigo_equipa && (
                        <p className="text-xs text-red-600 mt-1">
                            {erros.codigo_equipa}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_equipa"
                        value={form.tipo_equipa}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.tipo_equipa ? 'border-red-400' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Selecione...</option>
                        {tipos.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nome}
                            </option>
                        ))}
                    </select>
                    {erros.tipo_equipa && (
                        <p className="text-xs text-red-600 mt-1">
                            {erros.tipo_equipa}
                        </p>
                    )}
                </div>
            </div>

            {/* Instituicao + Distrito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instituição
                    </label>
                    <input
                        type="text"
                        name="instituicao"
                        value={form.instituicao}
                        onChange={handleChange}
                        placeholder="Ex: INGD, Cruz Vermelha, Bombeiros"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distrito de atuação
                    </label>
                    <select
                        name="distrito_atuacao"
                        value={form.distrito_atuacao}
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
            </div>

            {/* Lider + Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do líder
                    </label>
                    <input
                        type="text"
                        name="lider_nome"
                        value={form.lider_nome}
                        onChange={handleChange}
                        placeholder="Ex: João Silva"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone do líder
                    </label>
                    <input
                        type="text"
                        name="lider_telefone"
                        value={form.lider_telefone}
                        onChange={handleChange}
                        placeholder="+258840000000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Membros + Capacidade + Veiculo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nº de membros
                    </label>
                    <input
                        type="number"
                        name="numero_membros"
                        value={form.numero_membros}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidade de atendimento
                    </label>
                    <input
                        type="number"
                        name="capacidade_atendimento"
                        value={form.capacidade_atendimento}
                        onChange={handleChange}
                        min="0"
                        placeholder="Opcional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veículo
                    </label>
                    <input
                        type="text"
                        name="veiculo"
                        value={form.veiculo}
                        onChange={handleChange}
                        placeholder="Ex: Camião, Ambulância"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="standby">Standby</option>
                    <option value="em_missao">Em Missão</option>
                    <option value="descansando">A Descansar</option>
                    <option value="indisponivel">Indisponível</option>
                </select>
            </div>

            {/* Missao atual */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Missão atual (opcional)
                </label>
                <textarea
                    name="missao_atual"
                    value={form.missao_atual}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Descrição da missão em curso"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Coordenadas GPS */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Coordenadas GPS (opcional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        step="0.0001"
                        placeholder="Latitude (ex: -19.83)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                        type="number"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        step="0.0001"
                        placeholder="Longitude (ex: 34.84)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Ativo */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="ativo"
                        checked={form.ativo}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Equipa ativa
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
                    {loading ? 'A guardar...' : 'Criar Equipa'}
                </button>
            </div>
        </form>
    );
}