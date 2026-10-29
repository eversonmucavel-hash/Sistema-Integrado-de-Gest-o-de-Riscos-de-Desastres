import api from './api';

const risksService = {
    // Áreas de Risco
    listarAreas: (params = {}) => api.get('/risks/areas-risco/', { params }),
    obterArea: (id) => api.get(`/risks/areas-risco/${id}/`),
    criarArea: (data) => api.post('/risks/areas-risco/', data),
    atualizarArea: (id, data) => api.put(`/risks/areas-risco/${id}/`, data),
    apagarArea: (id) => api.delete(`/risks/areas-risco/${id}/`),

    // Tipos de Risco
    listarTipos: () => api.get('/risks/tipos-risco/'),

    // Áreas Seguras
    listarAreasSeguras: () => api.get('/risks/areas-seguras/'),

    // Rotas
    listarRotas: () => api.get('/risks/rotas-evacuacao/'),

    // Geografia
    listarDistritos: (params = {}) => api.get('/geography/distritos/', { params }),
    listarProvincias: () => api.get('/geography/provincias/'),
};

export default risksService;