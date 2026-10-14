-- ============================================
-- SIGRD - Equipas de Resposta
-- ============================================
-- Tipos de Equipa
CREATE TABLE IF NOT EXISTS tipos_equipa (
    id_tipo_equipa SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);
INSERT INTO tipos_equipa (codigo, nome)
VALUES ('BUSCA_SALVAMENTO', 'Busca e Salvamento'),
    ('SAUDE', 'Equipa Médica'),
    ('DISTRIBUICAO', 'Distribuição de Ajuda'),
    ('AVALIACAO', 'Avaliação de Danos'),
    ('EVACUACAO', 'Equipa de Evacuação'),
    ('COMUNICACAO', 'Comunicação e Coordenação') ON CONFLICT (codigo) DO NOTHING;
-- Equipas
CREATE TABLE IF NOT EXISTS equipas_resposta (
    id_equipa SERIAL PRIMARY KEY,
    id_tipo_equipa INTEGER REFERENCES tipos_equipa(id_tipo_equipa),
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    codigo_equipa VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    instituicao VARCHAR(200),
    lider_nome VARCHAR(200),
    lider_telefone VARCHAR(50),
    numero_membros INTEGER,
    geometria GEOMETRY(Point, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    ultima_atualizacao_gps TIMESTAMP,
    id_distrito_atuacao INTEGER REFERENCES distritos(id_distrito),
    area_atuacao GEOMETRY(Polygon, 4326),
    veiculo VARCHAR(100),
    equipamentos TEXT [],
    capacidade_atendimento INTEGER,
    status VARCHAR(50) CHECK (
        status IN (
            'standby',
            'em_missao',
            'descansando',
            'indisponivel'
        )
    ),
    missao_atual TEXT,
    data_ativacao TIMESTAMP,
    data_desativacao TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipas_geom ON equipas_resposta USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_equipas_status ON equipas_resposta(status);
CREATE INDEX IF NOT EXISTS idx_equipas_evento ON equipas_resposta(id_evento);
-- Missões
CREATE TABLE IF NOT EXISTS missoes (
    id_missao SERIAL PRIMARY KEY,
    id_equipa INTEGER REFERENCES equipas_resposta(id_equipa),
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    codigo_missao VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50),
    geometria GEOMETRY(Point, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    endereco TEXT,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_inicio TIMESTAMP,
    data_conclusao TIMESTAMP,
    duracao_minutos INTEGER,
    prioridade VARCHAR(20) CHECK (
        prioridade IN ('baixa', 'normal', 'alta', 'critica')
    ),
    status VARCHAR(50) CHECK (
        status IN (
            'pendente',
            'em_andamento',
            'concluida',
            'cancelada'
        )
    ),
    pessoas_atendidas INTEGER DEFAULT 0,
    pessoas_resgatadas INTEGER DEFAULT 0,
    recursos_distribuidos JSONB,
    relatorio TEXT,
    fotos TEXT [],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_missoes_equipa ON missoes(id_equipa);
CREATE INDEX IF NOT EXISTS idx_missoes_evento ON missoes(id_evento);
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes(status);
CREATE INDEX IF NOT EXISTS idx_missoes_geom ON missoes USING GIST(geometria);
-- Rastreamento GPS
CREATE TABLE IF NOT EXISTS rastreamento_gps (
    id_rastreamento BIGSERIAL PRIMARY KEY,
    id_equipa INTEGER REFERENCES equipas_resposta(id_equipa),
    id_missao INTEGER REFERENCES missoes(id_missao),
    geometria GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_m DECIMAL(8, 2),
    precisao_m DECIMAL(6, 2),
    velocidade_kmh DECIMAL(6, 2),
    direcao_graus DECIMAL(6, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispositivo VARCHAR(100),
    app_version VARCHAR(20)
);
CREATE INDEX IF NOT EXISTS idx_rastreamento_equipa ON rastreamento_gps(id_equipa);
CREATE INDEX IF NOT EXISTS idx_rastreamento_timestamp ON rastreamento_gps(timestamp);
CREATE INDEX IF NOT EXISTS idx_rastreamento_geom ON rastreamento_gps USING GIST(geometria);