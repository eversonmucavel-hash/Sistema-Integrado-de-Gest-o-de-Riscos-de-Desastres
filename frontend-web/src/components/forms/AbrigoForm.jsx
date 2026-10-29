
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Save, X, Loader2, MapPin } from 'lucide-react';
import sheltersService from '../../services/sheltersService';
import risksService from '../../services/risksService';

export default function AbrigoForm({ onSuccess, onCancel }) {
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        nome: '',
        tipo: 'permanente',
        distrito: '',
        endereco: '',
        capacidade_maxima: 100,
        ocupacao_atual: 0,
        status: 'aberto',
        condicao: 'boa',
        responsavel: '',
        telefone_contacto: '',
        latitude: '',
        longitude: '',
        tem_agua: true,
        tem_energia: true,
        tem_saneamento: true,
        tem_cozinha: false,
        tem_area_saude: false,
        ativo: true,
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const distsRes = await risksService.listarDistritos();
            setDistritos(distsRes.data.results || distsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
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

    const validar = () => {
        const novosErros = {};

        if (!form.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!form.distrito) novosErros.distrito = 'Distrito é obrigatório';
        if (!form.capacidade_maxima || Number(form.capacidade_maxima) <= 0) {
            novosErros.capacidade_maxima = 'Capacidade deve ser maior que 0';
        }
        if (Number(form.ocupacao_atual) > Number(form.capacidade_maxima)) {
            novosErros.ocupacao_atual = 'Ocupação não pode exceder a capacidade';
        }
        if (!form.latitude || !form.longitude) {
            novosErros.latitude = 'Latitude e longitude são obrigatórias';
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
            nome: form.nome.trim(),
            tipo: form.tipo,
            distrito: Number(form.distrito),
            endereco: form.endereco.trim(),
            capacidade_maxima: Number(form.capacidade_maxima),
            ocupacao_atual: Number(form.ocupacao_atual),
            status: form.status,
            condicao: form.condicao,
            responsavel: form.responsavel.trim(),
            telefone_contacto: form.telefone_contacto.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            tem_agua: form.tem_agua,
            tem_energia: form.tem_energia,
            tem_saneamento: form.tem_saneamento,
            tem_cozinha: form.tem_cozinha,
            tem_area_saude: form.tem_area_saude,
            ativo: form.ativo,
        };

        try {
    const response = await sheltersService.criarAbrigo(payload);
    toast.success('Abrigo criado com sucesso');
    onSuccess(response.data);
} catch (error) {
    console.error('Erro ao criar abrigo:', error);
    const dados = error.response?.data;
    if (dados && typeof dados === 'object') {
        const primeiro = Object.entries(dados)[0];
        setErro(`${primeiro[0]}: ${primeiro[1]}`);
    } else {
        setErro('Erro ao criar o abrigo.');
    }
    toast.error('Erro ao criar o abrigo');
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
                    placeholder="Ex: Abrigo Municipal da Beira"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.nome ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.nome && (
                    <p className="text-xs text-red-600 mt-1">{erros.nome}</p>
                )}
            </div>

            {/* Tipo + Distrito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="temporario">Temporário</option>
                        <option value="permanente">Permanente</option>
                        <option value="emergencia">Emergência</option>
                    </select>
                </div>

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
            </div>

            {/* Endereço */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                </label>
                <input
                    type="text"
                    name="endereco"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Ex: Rua 25 de Setembro, nº 123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Capacidade + Ocupação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidade máxima <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="capacidade_maxima"
                        value={form.capacidade_maxima}
                        onChange={handleChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.capacidade_maxima ? 'border-red-400' : 'border-gray-300'
                        }`}
                    />
                    {erros.capacidade_maxima && (
                        <p className="text-xs text-red-600 mt-1">
                            {erros.capacidade_maxima}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ocupação atual
                    </label>
                    <input
                        type="number"
                        name="ocupacao_atual"
                        value={form.ocupacao_atual}
                        onChange={handleChange}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.ocupacao_atual ? 'border-red-400' : 'border-gray-300'
                        }`}
                    />
                    {erros.ocupacao_atual && (
                        <p className="text-xs text-red-600 mt-1">
                            {erros.ocupacao_atual}
                        </p>
                    )}
                </div>
            </div>

            {/* Status + Condição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <option value="aberto">Aberto</option>
                        <option value="lotado">Lotado</option>
                        <option value="fechado">Fechado</option>
                        <option value="em_preparacao">Em Preparação</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condição
                    </label>
                    <select
                        name="condicao"
                        value={form.condicao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="otima">Ótima</option>
                        <option value="boa">Boa</option>
                        <option value="regular">Regular</option>
                        <option value="precaria">Precária</option>
                    </select>
                </div>
            </div>

            {/* Responsável + Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsável
                    </label>
                    <input
                        type="text"
                        name="responsavel"
                        value={form.responsavel}
                        onChange={handleChange}
                        placeholder="Nome do coordenador"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone de contacto
                    </label>
                    <input
                        type="text"
                        name="telefone_contacto"
                        value={form.telefone_contacto}
                        onChange={handleChange}
                        placeholder="+258840000000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Coordenadas GPS */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Coordenadas GPS <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input
                            type="number"
                            name="latitude"
                            value={form.latitude}
                            onChange={handleChange}
                            step="0.0001"
                            placeholder="Latitude (ex: -19.8300)"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                erros.latitude ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            name="longitude"
                            value={form.longitude}
                            onChange={handleChange}
                            step="0.0001"
                            placeholder="Longitude (ex: 34.8400)"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                erros.latitude ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                    </div>
                </div>
                {erros.latitude && (
                    <p className="text-xs text-red-600 mt-1">{erros.latitude}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Exemplo Moçambique: -19.8300 (lat), 34.8400 (lng)
                </p>
            </div>

            {/* Infraestrutura */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Infraestrutura disponível
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { key: 'tem_agua', label: 'Água' },
                        { key: 'tem_energia', label: 'Energia' },
                        { key: 'tem_saneamento', label: 'Saneamento' },
                        { key: 'tem_cozinha', label: 'Cozinha' },
                        { key: 'tem_area_saude', label: 'Área de saúde' },
                    ].map((item) => (
                        <label
                            key={item.key}
                            className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                        >
                            <input
                                type="checkbox"
                                name={item.key}
                                checked={form[item.key]}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            {item.label}
                        </label>
                    ))}
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
                    Abrigo ativo
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
                    {loading ? 'A guardar...' : 'Criar Abrigo'}
                </button>
            </div>
        </form>
    );
}