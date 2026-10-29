import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import resourcesService from '../../services/resourcesService';
import risksService from '../../services/risksService';

export default function RecursoForm({ onSuccess, onCancel }) {
    const [categorias, setCategorias] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        nome: '',
        descricao: '',
        categoria: '',
        quantidade_disponivel: 0,
        quantidade_alocada: 0,
        quantidade_distribuida: 0,
        unidade_medida: '',
        distrito: '',
        local_armazenamento: '',
        data_validade: '',
        doador: '',
        tipo_doador: '',
        valor_estimado_mt: '',
        status: 'disponivel',
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [catsRes, distsRes] = await Promise.all([
                resourcesService.listarCategorias(),
                risksService.listarDistritos(),
            ]);
            setCategorias(catsRes.data.results || catsRes.data || []);
            setDistritos(distsRes.data.results || distsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar categorias e distritos.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (erros[name]) {
            setErros((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const novosErros = {};

        if (!form.nome.trim()) {
            novosErros.nome = 'Nome é obrigatório';
        }
        if (!form.categoria) {
            novosErros.categoria = 'Categoria é obrigatória';
        }
        if (form.quantidade_disponivel === '' || Number(form.quantidade_disponivel) < 0) {
            novosErros.quantidade_disponivel = 'Quantidade deve ser um número positivo';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (!validar()) return;

        setLoading(true);

        // Preparar payload - remover campos vazios de FK
        const payload = { ...form };
        if (!payload.categoria) delete payload.categoria;
        if (!payload.distrito) delete payload.distrito;
        if (!payload.evento) delete payload.evento;
        if (!payload.data_validade) delete payload.data_validade;
        if (!payload.valor_estimado_mt) delete payload.valor_estimado_mt;
        if (!payload.doador) delete payload.doador;
        if (!payload.tipo_doador) delete payload.tipo_doador;
        if (!payload.unidade_medida) delete payload.unidade_medida;
        if (!payload.local_armazenamento) delete payload.local_armazenamento;

        // Converter números
        payload.quantidade_disponivel = Number(payload.quantidade_disponivel) || 0;
        payload.quantidade_alocada = Number(payload.quantidade_alocada) || 0;
        payload.quantidade_distribuida = Number(payload.quantidade_distribuida) || 0;

        try {
    const response = await resourcesService.criarRecurso(payload);
    toast.success('Recurso criado com sucesso');
    onSuccess(response.data);
} catch (error) {
    console.error('Erro ao criar recurso:', error);
    const mensagem =
        error.response?.data?.detail ||
        error.response?.data?.nome?.[0] ||
        'Erro ao criar o recurso. Verifica os campos.';
    setErro(mensagem);
    toast.error('Erro ao criar o recurso');
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
                    placeholder="Ex: Água Potável - Armazém Central"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.nome ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.nome && (
                    <p className="text-xs text-red-600 mt-1">{erros.nome}</p>
                )}
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Detalhes adicionais sobre o recurso..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Categoria + Unidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.categoria ? 'border-red-400' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Selecione...</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                    {erros.categoria && (
                        <p className="text-xs text-red-600 mt-1">{erros.categoria}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade de medida
                    </label>
                    <input
                        type="text"
                        name="unidade_medida"
                        value={form.unidade_medida}
                        onChange={handleChange}
                        placeholder="Ex: litros, kg, unidades"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Quantidades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disponível <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="quantidade_disponivel"
                        value={form.quantidade_disponivel}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.quantidade_disponivel ? 'border-red-400' : 'border-gray-300'
                        }`}
                    />
                    {erros.quantidade_disponivel && (
                        <p className="text-xs text-red-600 mt-1">
                            {erros.quantidade_disponivel}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alocada
                    </label>
                    <input
                        type="number"
                        name="quantidade_alocada"
                        value={form.quantidade_alocada}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distribuída
                    </label>
                    <input
                        type="number"
                        name="quantidade_distribuida"
                        value={form.quantidade_distribuida}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Distrito + Status */}
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
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="disponivel">Disponível</option>
                        <option value="alocado">Alocado</option>
                        <option value="distribuido">Distribuído</option>
                        <option value="expirado">Expirado</option>
                    </select>
                </div>
            </div>

            {/* Local + Data validade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local de armazenamento
                    </label>
                    <input
                        type="text"
                        name="local_armazenamento"
                        value={form.local_armazenamento}
                        onChange={handleChange}
                        placeholder="Ex: Armazém Central"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de validade
                    </label>
                    <input
                        type="date"
                        name="data_validade"
                        value={form.data_validade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Doador + Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doador
                    </label>
                    <input
                        type="text"
                        name="doador"
                        value={form.doador}
                        onChange={handleChange}
                        placeholder="Ex: UNICEF"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de doador
                    </label>
               <select
    name="tipo_doador"
    value={form.tipo_doador}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
>
    <option value="">Selecione...</option>
    <option value="governo">Governo</option>
    <option value="ong">ONG</option>
    <option value="privado">Privado</option>
    <option value="individual">Individual</option>
    <option value="internacional">Internacional</option>
</select>
                </div>
            </div>

            {/* Valor estimado */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor estimado (MT)
                </label>
                <input
                    type="number"
                    name="valor_estimado_mt"
                    value={form.valor_estimado_mt}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
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
                    {loading ? 'A guardar...' : 'Criar Recurso'}
                </button>
            </div>
        </form>
    );
}