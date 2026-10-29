import api from './api';

const alertsService = {
    // Alertas
    listarAlertas: (params = {}) => api.get('/alerts/alertas/', { params }),
    obterAlerta: (id) => api.get(`/alerts/alertas/${id}/`),
    criarAlerta: (data) => api.post('/alerts/alertas/', data),
    atualizarAlerta: (id, data) => api.put(`/alerts/alertas/${id}/`, data),
    apagarAlerta: (id) => api.delete(`/alerts/alertas/${id}/`),
    cancelarAlerta: (id) => api.post(`/alerts/alertas/${id}/cancelar/`),

    // Envio de SMS
    enviarSMS: (alertaId, destinatarios) =>
        api.post(`/alerts/alertas/${alertaId}/enviar_sms/`, { destinatarios }),
        // Disparar alerta para zona de risco
    dispararAlerta: (alertaId) =>
        api.post(`/alerts/alertas/${alertaId}/disparar/`),

    // Envios (com filtros)
    listarEnvios: (params = {}) => api.get('/alerts/envios/', { params }),

    // Eventos (Incidents)
    listarEventos: (params = {}) => api.get('/incidents/eventos/', { params }),
    obterEvento: (id) => api.get(`/incidents/eventos/${id}/`),
};

export default alertsService;