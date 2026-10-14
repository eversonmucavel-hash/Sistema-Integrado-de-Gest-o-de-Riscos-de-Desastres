-- ============================================
-- SIGRD - Sistema de Alertas
-- ============================================

-- Eventos de Desastre
CREATE TABLE IF NOT EXISTS eventos_desastre (
    id_evento        SERIAL PRIMARY KEY,
    codigo_evento    VARCHAR(50) UNIQUE NOT NULL,
    id_tipo_risco    INTEGER REFERENCES tipos_risco(id_tipo_risco),
    nome             VARCHAR(200) NOT NULL,
    descricao        TEXT,
    categoria        VARCHAR(50),
    intensidade      VARCHAR(20) CHECK (intensidade IN ('baixa','moderada','alta','extrema')),
    data_inicio      TIMESTAMP NOT NULL,
    data_fim         TIMESTAMP,
    duracao_horas    INTEGER,
    ativo            BOOLEAN DEFAULT TRUE,
    geometria        GEOMETRY(MultiPolygon, 4326),
    area_afetada_km2 DECIMAL(15,2),
    distritos_afetados INTEGER[],
    pessoas_afetadas INTEGER DEFAULT 0,
    pessoas_deslocadas INTEGER DEFAULT 0,
    mortes           INTEGER DEFAULT 0,
    feridos          INTEGER DEFAULT 0,
    habitacoes_destruidas INTEGER DEFAULT 0,
    habitacoes_danificadas INTEGER DEFAULT 0,
    velocidade_vento_kmh DECIMAL(6,2),
    precipitacao_mm  DECIMAL(8,2),
    nivel_agua_m     DECIMAL(6,2),
    nivel_alerta     VARCHAR(20) CHECK (nivel_alerta IN ('verde','amarelo','laranja','vermelho')),
    estado_resposta  VARCHAR(50) CHECK (estado_resposta IN ('monitoramento','alerta','emergencia','recuperacao','encerrado')),
    coordenador_responsavel VARCHAR(200),
    cenoe_ativado    BOOLEAN DEFAULT FALSE,
    fonte_informacao VARCHAR(200),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eventos_geom ON eventos_desastre USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos_desastre(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_ativo ON eventos_desastre(ativo);
CREATE INDEX IF NOT EXISTS idx_eventos_nivel_alerta ON eventos_desastre(nivel_alerta);

-- Alertas
CREATE TABLE IF NOT EXISTS alertas (
    id_alerta        SERIAL PRIMARY KEY,
    id_evento        INTEGER REFERENCES eventos_desastre(id_evento),
    id_tipo_risco    INTEGER REFERENCES tipos_risco(id_tipo_risco),
    titulo           VARCHAR(200) NOT NULL,
    mensagem         TEXT NOT NULL,
    nivel            VARCHAR(20) CHECK (nivel IN ('informativo','atencao','urgente','critico')),
    prioridade       INTEGER CHECK (prioridade BETWEEN 1 AND 5),
    geometria        GEOMETRY(MultiPolygon, 4326),
    distritos_alvo   INTEGER[],
    raio_km          DECIMAL(8,2),
    data_emissao     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valido_ate       TIMESTAMP,
    acoes_recomendadas TEXT[],
    areas_evacuacao  TEXT,
    canais           VARCHAR(100)[],
    total_destinatarios INTEGER,
    total_enviados   INTEGER DEFAULT 0,
    total_confirmados INTEGER DEFAULT 0,
    emitido_por      INTEGER,
    emitido_por_entidade VARCHAR(100),
    cancelado        BOOLEAN DEFAULT FALSE,
    data_cancelamento TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alertas_geom ON alertas USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_alertas_nivel ON alertas(nivel);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_alertas_validade ON alertas(valido_ate);

-- Log de Alertas Enviados
CREATE TABLE IF NOT EXISTS alertas_enviados (
    id_envio         BIGSERIAL PRIMARY KEY,
    id_alerta        INTEGER REFERENCES alertas(id_alerta),
    id_destinatario  INTEGER,
    canal            VARCHAR(20) CHECK (canal IN ('SMS','EMAIL','APP','WEB','RADIO','USSD')),
    destinatario     VARCHAR(200),
    mensagem_enviada TEXT,
    status           VARCHAR(20) CHECK (status IN ('pendente','enviado','entregue','falhou','lido')),
    data_envio       TIMESTAMP,
    data_entrega     TIMESTAMP,
    data_leitura     TIMESTAMP,
    erro             TEXT,
    tentativas       INTEGER DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alertas_enviados_alerta ON alertas_enviados(id_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_enviados_status ON alertas_enviados(status);
CREATE INDEX IF NOT EXISTS idx_alertas_enviados_canal ON alertas_enviados(canal);