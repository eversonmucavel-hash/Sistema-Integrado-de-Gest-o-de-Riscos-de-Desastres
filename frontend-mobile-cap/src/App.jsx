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
import RiscoDetalhe from './pages/RiscoDetalhe';
import AbrigoDetalhe from './pages/AbrigoDetalhe';
import AlertaDetalhe from './pages/AlertaDetalhe';
import EquipaDetalhe from './pages/EquipaDetalhe';
import Cidadaos from './pages/Cidadaos';
import CidadaoDetalhe from './pages/CidadaoDetalhe';
import RegistoPublico from './pages/RegistoPublico';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/registar" element={<RegistoPublico />} />
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
                        <Route path="/riscos/:id" element={<RiscoDetalhe />} />
                        <Route path="/alertas" element={<Alertas />} />
                        <Route path="/alertas/:id" element={<AlertaDetalhe />} />
                        <Route path="/abrigos" element={<Abrigos />} />
                        <Route path="/abrigos/:id" element={<AbrigoDetalhe />} />
                        <Route path="/equipas" element={<Equipas />} />
                        <Route path="/equipas/:id" element={<EquipaDetalhe />} />
                        <Route path="/recursos" element={<Recursos />} />
                        <Route path="/cidadaos" element={<Cidadaos />} />
                        <Route path="/cidadaos/:id" element={<CidadaoDetalhe />} /> 
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;