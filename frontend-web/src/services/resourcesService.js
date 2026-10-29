import api from './api';

const resourcesService = {
    // Recursos
    listarRecursos: (params = {}) => api.get('/resources/recursos/', { params }),
    obterRecurso: (id) => api.get(`/resources/recursos/${id}/`),
    criarRecurso: (data) => api.post('/resources/recursos/', data),
    atualizarRecurso: (id, data) => api.put(`/resources/recursos/${id}/`, data),
    apagarRecurso: (id) => api.delete(`/resources/recursos/${id}/`),

    // Categorias
    listarCategorias: () => api.get('/resources/categorias/'),

    // Distribuições
    listarDistribuicoes: (params = {}) =>
        api.get('/resources/distribuicoes/', { params }),
    obterDistribuicao: (id) => api.get(`/resources/distribuicoes/${id}/`),
    criarDistribuicao: (data) => api.post('/resources/distribuicoes/', data),
};

export default resourcesService;