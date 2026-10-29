import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Erro no login:', err);
            let detalhe = '';
            if (err.response) {
                detalhe = `Servidor respondeu ${err.response.status}`;
            } else if (err.request) {
                detalhe = 'Sem resposta do servidor. Verifica a rede.';
            } else {
                detalhe = err.message;
            }
            setError(detalhe);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 p-6">
            {/* Logo e título */}
            <div className="text-center mb-8">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 inline-flex items-center justify-center mb-4">
                    <ShieldAlert className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">SIGRD</h1>
                <p className="text-sm text-blue-200">Sistema de Gestão de Riscos</p>
                <p className="text-xs text-blue-300 mt-1">Moçambique</p>
            </div>

            {/* Card de login */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Bem-vindo</h2>
                <p className="text-xs text-gray-500 mb-5">Introduza as suas credenciais</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@sigrd.mz"
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Palavra-passe
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                A entrar...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
            </div>

            {/* Rodapé */}
            <p className="text-xs text-blue-300 mt-6 text-center">
                © 2026 SIGRD • Moçambique
            </p>
        </div>
    );
}