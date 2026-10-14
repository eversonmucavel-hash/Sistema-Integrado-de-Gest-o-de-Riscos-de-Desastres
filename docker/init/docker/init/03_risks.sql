-- ============================================
-- SIGRD - Mapeamento de Riscos
-- ============================================
-- Tipos de Risco
CREATE TABLE IF NOT EXISTS tipos_risco (
    id_tipo_risco SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor_mapa VARCHAR(7),
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE
);
INSERT INTO tipos_risco (codigo, nome, cor_mapa, icone)
VALUES (
        'CICLONE',
        'Ciclone Tropical',
        '#FF0000',
        'cyclone'
    ),
    (
        'CHEIA',
        'Cheia/Inundação',
        '#0000FF',
        'flood'
    ),
    (
        'SECA',
        'Seca',
        '#FFA500',
        'drought'
    ),
    (
        'INCENDIO',
        'Incêndio Florestal',
        '#FF6600',
        'fire'
    ),
    (
        'EROSAO',
        'Erosão Costeira',
        '#8B4513',
        'erosion'
    ),
    (
        'DESLIZAMENTO',
        'Deslizamento de Terra',
        '#A0522D',
        'landslide'
    ),
    (
        'SISMO',
        'Sismo',
        '#800080',
        'earthquake'
    ) ON CONFLICT (codigo) DO NOTHING;
-- Áreas de Risco
CREATE TABLE IF NOT EXISTS areas_risco (
    id_area_risco SERIAL PRIMARY KEY,
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    id_tipo_risco INTEGER REFERENCES tipos_risco(id_tipo_risco),
    nome_area VARCHAR(200),
    descricao TEXT,
    geometria GEOMETRY(Polygon, 4326) NOT NULL,
    area_m2 DECIMAL(15, 2),
    perimetro_m DECIMAL(15, 2),
    nivel_risco VARCHAR(20) CHECK (
        nivel_risco IN ('baixo', 'medio', 'alto', 'critico')
    ),
    probabilidade VARCHAR(20) CHECK (
        probabilidade IN ('rara', 'possivel', 'provavel', 'certa')
    ),
    impacto VARCHAR(20) CHECK (
        impacto IN ('minimo', 'moderado', 'grave', 'catastrofico')
    ),
    populacao_exposta INTEGER,
    familias_expostas INTEGER,
    escolas_em_risco INTEGER DEFAULT 0,
    centros_saude_em_risco INTEGER DEFAULT 0,
    habitacoes_em_risco INTEGER DEFAULT 0,
    validado BOOLEAN DEFAULT FALSE,
    validado_por INTEGER,
    data_validacao TIMESTAMP,
    fonte_dados VARCHAR(100),
    precisao_metros DECIMAL(8, 2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_areas_risco_geom ON areas_risco USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_areas_risco_tipo ON areas_risco(id_tipo_risco);
CREATE INDEX IF NOT EXISTS idx_areas_risco_nivel ON areas_risco(nivel_risco);
-- Áreas Seguras
CREATE TABLE IF NOT EXISTS areas_seguras (
    id_area_segura SERIAL PRIMARY KEY,
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) CHECK (
        tipo IN ('zona_alta', 'area_protegida', 'zona_evacuacao')
    ),
    geometria GEOMETRY(Polygon, 4326) NOT NULL,
    area_m2 DECIMAL(15, 2),
    altitude_media_m DECIMAL(8, 2),
    capacidade_pessoas INTEGER,
    acessibilidade VARCHAR(100),
    tem_agua_potavel BOOLEAN DEFAULT FALSE,
    tem_energia BOOLEAN DEFAULT FALSE,
    tem_comunicacao BOOLEAN DEFAULT FALSE,
    tem_saneamento BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    validado BOOLEAN DEFAULT FALSE,
    ultima_inspecao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_areas_seguras_geom ON areas_seguras USING GIST(geometria);
-- Rotas de Evacuação
CREATE TABLE IF NOT EXISTS rotas_evacuacao (
    id_rota SERIAL PRIMARY KEY,
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    id_area_origem INTEGER REFERENCES areas_risco(id_area_risco),
    id_area_destino INTEGER REFERENCES areas_seguras(id_area_segura),
    nome VARCHAR(200),
    descricao TEXT,
    geometria GEOMETRY(LineString, 4326) NOT NULL,
    distancia_m DECIMAL(10, 2),
    tempo_estimado_minutos INTEGER,
    largura_media_m DECIMAL(6, 2),
    tipo_superficie VARCHAR(50),
    condicao VARCHAR(50) CHECK (
        condicao IN ('otima', 'boa', 'regular', 'precaria')
    ),
    acessivel_veiculos BOOLEAN DEFAULT FALSE,
    iluminacao BOOLEAN DEFAULT FALSE,
    pontos_referencia JSONB,
    ultima_verificacao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rotas_geom ON rotas_evacuacao USING GIST(geometria);