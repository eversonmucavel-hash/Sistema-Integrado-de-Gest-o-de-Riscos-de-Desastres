import api from './api';

const citizensService = {
    // Cidadãos
    listarCidadaos: (params = {}) => api.get('/citizens/pessoas/', { params }),
    obterCidadao: (id) => api.get(`/citizens/pessoas/${id}/`),
    criarCidadao: (data) => api.post('/citizens/pessoas/', data),
    atualizarCidadao: (id, data) => api.put(`/citizens/pessoas/${id}/`, data),
    apagarCidadao: (id) => api.delete(`/citizens/pessoas/${id}/`),

    // Estatísticas e agregações
    estatisticas: () => api.get('/citizens/pessoas/estatisticas/'),
    porDistrito: () => api.get('/citizens/pessoas/por_distrito/'),
    geojson: () => api.get('/citizens/pessoas/geojson/'),

    // Registo público (sem autenticação)
    registarPublico: (data) => api.post('/citizens/registar/', data),
};

export default citizensService;