import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Map,
    AlertTriangle,
    Bell,
    Home,
    Users,
    Package,
    LogOut,
    ShieldAlert,
    UserCheck,
} from 'lucide-react';

export default function Layout() {
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
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col">
                <div className="p-4 border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-2">
                            <ShieldAlert className="w-6 h-6 text-blue-900" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-none">SIGRD</h1>
                            <p className="text-xs text-blue-300 mt-1">Moçambique</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                                    isActive
                                        ? 'bg-blue-700 font-semibold'
                                        : 'hover:bg-blue-800'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Sistema Integrado de Gestão de Riscos de Desastres
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {user?.nome_completo || 'Utilizador'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}