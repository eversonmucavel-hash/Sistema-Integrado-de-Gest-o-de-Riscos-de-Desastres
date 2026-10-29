/**
 * SIGRD - Serviço de cache local
 * Guarda dados no localStorage para funcionar offline
 */

const CACHE_PREFIX = 'sigrd_cache_';
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

export const cache = {
    // Guardar dados
    set: (key, data) => {
        try {
            const item = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (e) {
            console.error('Erro ao guardar cache:', e);
        }
    },

    // Ler dados
    get: (key, ignoreTTL = false) => {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;

            const item = JSON.parse(raw);

            // Verificar se expirou (exceto se ignorar TTL)
            if (!ignoreTTL && Date.now() - item.timestamp > CACHE_TTL) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }

            return item.data;
        } catch (e) {
            console.error('Erro ao ler cache:', e);
            return null;
        }
    },

    // Verificar se existe e é válido
    has: (key) => {
        return cache.get(key) !== null;
    },

    // Apagar um item
    remove: (key) => {
        localStorage.removeItem(CACHE_PREFIX + key);
    },

    // Apagar tudo
    clear: () => {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
        keys.forEach((k) => localStorage.removeItem(k));
    },

    // Ver data da última atualização
    lastUpdate: (key) => {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;
            return JSON.parse(raw).timestamp;
        } catch {
            return null;
        }
    },
};