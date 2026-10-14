import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mapa from './pages/Mapa';
import Riscos from './pages/Riscos';
import Alertas from './pages/Alertas';
import Abrigos from './pages/Abrigos';
import Equipas from './pages/Equipas';
import Recursos from './pages/Recursos';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/mapa" element={<Mapa />} />
                        <Route path="/riscos" element={<Riscos />} />
                        <Route path="/alertas" element={<Alertas />} />
                        <Route path="/abrigos" element={<Abrigos />} />
                        <Route path="/equipas" element={<Equipas />} />
                        <Route path="/recursos" element={<Recursos />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;