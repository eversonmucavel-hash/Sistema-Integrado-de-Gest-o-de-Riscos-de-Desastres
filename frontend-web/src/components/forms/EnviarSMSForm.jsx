import { useState } from 'react';
import { Plus, Trash2, Send, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import alertsService from '../../services/alertsService';

export default function EnviarSMSForm({ alertaId, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [destinatarios, setDestinatarios] = useState([
        { numero: '', nome: '' },
    ]);

    const adicionar = () => {
        setDestinatarios([...destinatarios, { numero: '', nome: '' }]);
    };

    const remover = (index) => {
        if (destinatarios.length === 1) return;
        setDestinatarios(destinatarios.filter((_, i) => i !== index));
    };

    const alterar = (index, campo, valor) => {
        const novos = [...destinatarios];
        novos[index][campo] = valor;
        setDestinatarios(novos);
    };

    const validar = () => {
        const validos = destinatarios.filter(
            (d) => d.numero.trim() && d.numero.startsWith('+')
        );
        if (validos.length === 0) {
            setErro('Adicione pelo menos um número válido (começando por +)');
            return null;
        }
        return validos;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        const validos = validar();
        if (!validos) return;

        setLoading(true);
        try {
            const response = await alertsService.enviarSMS(alertaId, validos);
            toast.success(
                `Envio iniciado para ${validos.length} destinatário(s)`
            );
            onSuccess(response.data);
        } catch (error) {
            console.error('Erro ao enviar SMS:', error);
            const msg =
                error.response?.data?.erro ||
                'Erro ao iniciar o envio de SMS';
            setErro(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
                <p>
                    O envio é feito em <strong>background</strong> pelo Celery. Pode
                    continuar a usar o sistema enquanto os SMS são processados.
                </p>
            </div>

            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {erro}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatários ({destinatarios.length})
                </label>

                <div className="space-y-2">
                    {destinatarios.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={d.numero}
                                onChange={(e) =>
                                    alterar(i, 'numero', e.target.value)
                                }
                                placeholder="+258840000000"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            />
                            <input
                                type="text"
                                value={d.nome}
                                onChange={(e) =>
                                    alterar(i, 'nome', e.target.value)
                                }
                                placeholder="Nome (opcional)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => remover(i)}
                                disabled={destinatarios.length === 1}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={adicionar}
                    className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    <UserPlus className="w-4 h-4" />
                    Adicionar destinatário
                </button>
            </div>

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
                        <Send className="w-4 h-4" />
                    )}
                    {loading ? 'A enviar...' : 'Enviar SMS'}
                </button>
            </div>
        </form>
    );
}