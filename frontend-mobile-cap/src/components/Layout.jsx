import OfflineBanner from './OfflineBanner';
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Menu, X, LayoutDashboard, Map, AlertTriangle, Bell,
    Home, Users, Package, LogOut, ShieldAlert, UserCheck,
} from 'lucide-react';

export default function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/mapa', label: 'Mapa', icon: Map },
        { path: '/riscos', label: 'Riscos', icon: AlertTriangle },
        { path: '/alertas', label: 'Alertas', icon: Bell },
        { path: '/abrigos', label: 'Abrigos', icon: Home },
        { path: '/equipas', label: 'Equipas', icon: Users },
        { path: '/recursos', label: 'Recursos', icon: Package },
        { path: '/cidadaos', label: 'Cidadãos', icon: UserCheck },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* HEADER FIXO NO TOPO */}
            <header className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-[1001] shadow-md">
                <button onClick={() => setIsMenuOpen(true)} className="p-1">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6" />
                    <span className="font-bold text-lg">SIGRD</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Sair"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>
            <OfflineBanner />

            {/* OVERLAY ESCURO (fecha o menu) */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[1002]"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* MENU LATERAL (FIXO, SOBREPÕE) */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-72 bg-blue-900 text-white z-[1003]
                    transform transition-transform duration-300 ease-in-out shadow-2xl
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col
                `}
            >
                <div className="flex items-center justify-between p-4 border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6" />
                        <div>
                            <h1 className="text-lg font-bold leading-none">SIGRD</h1>
                            <p className="text-xs text-blue-300 mt-1">Moçambique</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-4 py-2 border-b border-blue-800">
                    <p className="text-xs text-blue-300">Utilizador</p>
                    <p className="text-sm font-medium text-white truncate">
                        {user?.nome_completo || 'Administrador'}
                    </p>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition text-sm ${
                                    isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-800'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}