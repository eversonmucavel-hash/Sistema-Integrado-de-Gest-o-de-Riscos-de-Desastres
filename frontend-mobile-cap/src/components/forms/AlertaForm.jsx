import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, X } from 'lucide-react';
import alertsService from '../../services/alertsService';
import risksService from '../../services/risksService';

const CANAIS_DISPONIVEIS = ['SMS', 'APP', 'RADIO', 'WEB', 'EMAIL', 'USSD'];

export default function AlertaForm({ onSuccess, onCancel }) {
    const [tiposRisco, setTiposRisco] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [erro, setErro] = useState('');
    const [erros, setErros] = useState({});

    const [form, setForm] = useState({
        titulo: '',
        mensagem: '',
        tipo_risco: '',
        evento: '',
        nivel: 'atencao',
        prioridade: 3,
        canais: ['SMS'],
        distritos_alvo: [],
        acoes_recomendadas: [''],
        areas_evacuacao: '',
        valido_ate: '',
        total_destinatarios: 0,
        emitido_por_entidade: '',
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [tiposRes, eventosRes, distritosRes] = await Promise.all([
                risksService.listarTipos(),
                alertsService.listarEventos(),
                risksService.listarDistritos(),
            ]);
            setTiposRisco(tiposRes.data.results || tiposRes.data || []);
            setEventos(eventosRes.data.results || eventosRes.data || []);
            setDistritos(distritosRes.data.results || distritosRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar tipos de risco, eventos e distritos.');
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

    const toggleCanal = (canal) => {
        setForm((prev) => ({
            ...prev,
            canais: prev.canais.includes(canal)
                ? prev.canais.filter((c) => c !== canal)
                : [...prev.canais, canal],
        }));
    };

    const toggleDistrito = (id) => {
        setForm((prev) => ({
            ...prev,
            distritos_alvo: prev.distritos_alvo.includes(id)
                ? prev.distritos_alvo.filter((d) => d !== id)
                : [...prev.distritos_alvo, id],
        }));
    };

    const handleAcaoChange = (index, valor) => {
        const novas = [...form.acoes_recomendadas];
        novas[index] = valor;
        setForm((prev) => ({ ...prev, acoes_recomendadas: novas }));
    };

    const adicionarAcao = () => {
        setForm((prev) => ({
            ...prev,
            acoes_recomendadas: [...prev.acoes_recomendadas, ''],
        }));
    };

    const removerAcao = (index) => {
        setForm((prev) => ({
            ...prev,
            acoes_recomendadas: prev.acoes_recomendadas.filter((_, i) => i !== index),
        }));
    };

    const validar = () => {
        const novosErros = {};

        if (!form.titulo.trim()) novosErros.titulo = 'Título é obrigatório';
        if (!form.mensagem.trim()) novosErros.mensagem = 'Mensagem é obrigatória';
        if (!form.tipo_risco) novosErros.tipo_risco = 'Tipo de risco é obrigatório';
        if (!form.nivel) novosErros.nivel = 'Nível é obrigatório';
        if (form.canais.length === 0)
            novosErros.canais = 'Selecione pelo menos um canal';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (!validar()) return;

        setLoading(true);

        // Filtrar ações vazias
        const acoesLimpas = form.acoes_recomendadas
            .map((a) => a.trim())
            .filter((a) => a);

        const payload = {
            titulo: form.titulo.trim(),
            mensagem: form.mensagem.trim(),
            tipo_risco: Number(form.tipo_risco),
            nivel: form.nivel,
            prioridade: Number(form.prioridade) || 3,
            canais: form.canais,
            distritos_alvo: form.distritos_alvo,
            acoes_recomendadas: acoesLimpas,
            total_destinatarios: Number(form.total_destinatarios) || 0,
        };

        if (form.evento) payload.evento = Number(form.evento);
        if (form.areas_evacuacao.trim())
            payload.areas_evacuacao = form.areas_evacuacao.trim();
        if (form.emitido_por_entidade.trim())
            payload.emitido_por_entidade = form.emitido_por_entidade.trim();
        if (form.valido_ate) {
            payload.valido_ate = new Date(form.valido_ate).toISOString();
        }

        try {
    const response = await sheltersService.criarAlerta(payload);
    toast.success('alerta criado com sucesso');
    onSuccess(response.data);
} catch (error) {
    console.error('Erro ao criar alerta:', error);
    const dados = error.response?.data;
    if (dados && typeof dados === 'object') {
        const primeiro = Object.entries(dados)[0];
        setErro(`${primeiro[0]}: ${primeiro[1]}`);
    } else {
        setErro('Erro ao criar o alerta.');
    }
    toast.error('Erro ao criar o alerta');
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

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Alerta Laranja - Cheias na Bacia do Búzi"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.titulo ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.titulo && (
                    <p className="text-xs text-red-600 mt-1">{erros.titulo}</p>
                )}
            </div>

            {/* Mensagem */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Descreva a situação e instruções..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                        erros.mensagem ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                {erros.mensagem && (
                    <p className="text-xs text-red-600 mt-1">{erros.mensagem}</p>
                )}
            </div>

            {/* Tipo + Nível */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de risco <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_risco"
                        value={form.tipo_risco}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                            erros.tipo_risco ? 'border-red-400' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Selecione...</option>
                        {tiposRisco.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nome}
                            </option>
                        ))}
                    </select>
                    {erros.tipo_risco && (
                        <p className="text-xs text-red-600 mt-1">{erros.tipo_risco}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nível <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="nivel"
                        value={form.nivel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="informativo">Informativo</option>
                        <option value="atencao">Atenção</option>
                        <option value="urgente">Urgente</option>
                        <option value="critico">Crítico</option>
                    </select>
                </div>
            </div>

            {/* Evento + Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evento associado (opcional)
                    </label>
                    <select
                        name="evento"
                        value={form.evento}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Sem evento associado</option>
                        {eventos.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.codigo_evento} - {ev.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade (1-5)
                    </label>
                    <input
                        type="number"
                        name="prioridade"
                        value={form.prioridade}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Canais */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canais de distribuição <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {CANAIS_DISPONIVEIS.map((canal) => (
                        <button
                            key={canal}
                            type="button"
                            onClick={() => toggleCanal(canal)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                form.canais.includes(canal)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {canal}
                        </button>
                    ))}
                </div>
                {erros.canais && (
                    <p className="text-xs text-red-600 mt-1">{erros.canais}</p>
                )}
            </div>

            {/* Distritos alvo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distritos alvo ({form.distritos_alvo.length} selecionados)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {distritos.map((d) => (
                            <label
                                key={d.id}
                                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={form.distritos_alvo.includes(d.id)}
                                    onChange={() => toggleDistrito(d.id)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                {d.nome}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ações recomendadas */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ações recomendadas
                </label>
                <div className="space-y-2">
                    {form.acoes_recomendadas.map((acao, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="text"
                                value={acao}
                                onChange={(e) => handleAcaoChange(i, e.target.value)}
                                placeholder="Ex: Evacuar zona ribeirinha"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            {form.acoes_recomendadas.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removerAcao(i)}
                                    className="px-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={adicionarAcao}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar ação
                    </button>
                </div>
            </div>

            {/* Áreas de evacuação */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Áreas de evacuação
                </label>
                <input
                    type="text"
                    name="areas_evacuacao"
                    value={form.areas_evacuacao}
                    onChange={handleChange}
                    placeholder="Ex: Zona Alta de Búzi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Válido até + Total destinatários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Válido até
                    </label>
                    <input
                        type="datetime-local"
                        name="valido_ate"
                        value={form.valido_ate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total de destinatários
                    </label>
                    <input
                        type="number"
                        name="total_destinatarios"
                        value={form.total_destinatarios}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Emitido por */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emitido por (entidade)
                </label>
                <input
                    type="text"
                    name="emitido_por_entidade"
                    value={form.emitido_por_entidade}
                    onChange={handleChange}
                    placeholder="Ex: INGD, INAM"
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
                    {loading ? 'A guardar...' : 'Criar Alerta'}
                </button>
            </div>
        </form>
    );
}