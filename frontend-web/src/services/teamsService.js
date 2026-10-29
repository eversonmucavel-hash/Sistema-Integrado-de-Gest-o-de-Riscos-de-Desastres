import api from './api';

const teamsService = {
    // Equipas
    listarEquipas: (params = {}) => api.get('/teams/equipas/', { params }),
    obterEquipa: (id) => api.get(`/teams/equipas/${id}/`),
    criarEquipa: (data) => api.post('/teams/equipas/', data),
    atualizarEquipa: (id, data) => api.put(`/teams/equipas/${id}/`, data),
    apagarEquipa: (id) => api.delete(`/teams/equipas/${id}/`),

    // Tipos
    listarTipos: () => api.get('/teams/tipos-equipa/'),

    // Missões
    listarMissoes: (params = {}) => api.get('/teams/missoes/', { params }),
    obterMissao: (id) => api.get(`/teams/missoes/${id}/`),

    // Rastreamento
    listarRastreamento: (params = {}) => api.get('/teams/rastreamento/', { params }),
};

export default teamsService;