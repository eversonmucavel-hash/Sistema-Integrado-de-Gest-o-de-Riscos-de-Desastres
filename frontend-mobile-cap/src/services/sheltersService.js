import api from './api';

const sheltersService = {
    // Abrigos
    listarAbrigos: (params = {}) => api.get('/shelters/abrigos/', { params }),
    obterAbrigo: (id) => api.get(`/shelters/abrigos/${id}/`),
    criarAbrigo: (data) => api.post('/shelters/abrigos/', data),
    atualizarAbrigo: (id, data) => api.put(`/shelters/abrigos/${id}/`, data),
    apagarAbrigo: (id) => api.delete(`/shelters/abrigos/${id}/`),

    // Infraestruturas
    listarInfraestruturas: (params = {}) => api.get('/shelters/infraestruturas/', { params }),
    obterInfraestrutura: (id) => api.get(`/shelters/infraestruturas/${id}/`),

    // Categorias
    listarCategorias: () => api.get('/shelters/categorias/'),

    // Deslocados (com filtros)
    listarDeslocados: (params = {}) => api.get('/displaced/deslocados/', { params }),
    obterDeslocado: (id) => api.get(`/displaced/deslocados/${id}/`),
    criarDeslocado: (data) => api.post('/displaced/deslocados/', data),
    atualizarDeslocado: (id, data) => api.put(`/displaced/deslocados/${id}/`, data),
    apagarDeslocado: (id) => api.delete(`/displaced/deslocados/${id}/`),
};

export default sheltersService;