import { createContext, useContext, useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [estado, setEstado] = useState({
        aberto: false,
        titulo: '',
        mensagem: '',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        variante: 'warning',
    });
    const resolverRef = useRef(null);

    const confirmar = (opcoes) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setEstado({
                aberto: true,
                titulo: opcoes.titulo || 'Confirmar ação',
                mensagem: opcoes.mensagem || 'Tens a certeza?',
                textoConfirmar: opcoes.textoConfirmar || 'Confirmar',
                textoCancelar: opcoes.textoCancelar || 'Cancelar',
                variante: opcoes.variante || 'warning',
            });
        });
    };

    const fechar = (resultado) => {
        setEstado((prev) => ({ ...prev, aberto: false }));
        if (resolverRef.current) {
            resolverRef.current(resultado);
            resolverRef.current = null;
        }
    };

    const variantes = {
        warning: { cor: 'bg-yellow-100', icone: 'text-yellow-600', botao: 'bg-yellow-600 hover:bg-yellow-700' },
        danger: { cor: 'bg-red-100', icone: 'text-red-600', botao: 'bg-red-600 hover:bg-red-700' },
        info: { cor: 'bg-blue-100', icone: 'text-blue-600', botao: 'bg-blue-600 hover:bg-blue-700' },
    };

    const v = variantes[estado.variante] || variantes.warning;

    return (
        <ConfirmContext.Provider value={confirmar}>
            {children}
            {estado.aberto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000]"
                    onClick={() => fechar(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`${v.cor} p-3 rounded-full`}>
                                <AlertTriangle className={`w-6 h-6 ${v.icone}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {estado.titulo}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {estado.mensagem}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => fechar(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
                            >
                                {estado.textoCancelar}
                            </button>
                            <button
                                onClick={() => fechar(true)}
                                className={`px-4 py-2 text-white rounded-lg transition text-sm font-medium ${v.botao}`}
                            >
                                {estado.textoConfirmar}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
    }
    return context;
}