-- ============================================
-- SIGRD - Abrigos e Deslocados
-- ============================================
-- Categorias de Infraestrutura
CREATE TABLE IF NOT EXISTS categorias_infraestrutura (
    id_categoria SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(50),
    cor VARCHAR(7)
);
INSERT INTO categorias_infraestrutura (codigo, nome, icone, cor)
VALUES (
        'ABRIGO',
        'Centro de Acomodação',
        'shelter',
        '#00FF00'
    ),
    (
        'SAUDE',
        'Centro de Saúde',
        'hospital',
        '#FF0000'
    ),
    (
        'ESCOLA',
        'Escola',
        'school',
        '#0000FF'
    ),
    (
        'AGUA',
        'Fonte de Água',
        'water',
        '#00FFFF'
    ),
    (
        'ENERGIA',
        'Infraestrutura Energética',
        'power',
        '#FFFF00'
    ),
    (
        'COMUNICACAO',
        'Torre de Comunicação',
        'antenna',
        '#FF00FF'
    ),
    (
        'PONTE',
        'Ponte',
        'bridge',
        '#808080'
    ),
    (
        'ESTRADA',
        'Estrada Principal',
        'road',
        '#000000'
    ),
    (
        'POLICIA',
        'Posto Policial',
        'police',
        '#000080'
    ),
    (
        'BOMBEIROS',
        'Quartel de Bombeiros',
        'fire_station',
        '#FF4500'
    ) ON CONFLICT (codigo) DO NOTHING;
-- Infraestruturas
CREATE TABLE IF NOT EXISTS infraestruturas (
    id_infraestrutura SERIAL PRIMARY KEY,
    id_categoria INTEGER REFERENCES categorias_infraestrutura(id_categoria),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    endereco TEXT,
    geometria GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_m DECIMAL(8, 2),
    telephone VARCHAR(50),
    email VARCHAR(100),
    responsavel VARCHAR(200),
    capacidade_pessoas INTEGER,
    capacidade_atual INTEGER DEFAULT 0,
    operacional BOOLEAN DEFAULT TRUE,
    condicao VARCHAR(50) CHECK (
        condicao IN ('otima', 'boa', 'regular', 'precaria', 'destruida')
    ),
    recursos JSONB,
    em_area_risco BOOLEAN DEFAULT FALSE,
    id_area_risco INTEGER REFERENCES areas_risco(id_area_risco),
    nivel_vulnerabilidade VARCHAR(20),
    fonte_dados VARCHAR(100),
    precisao_gps_metros DECIMAL(6, 2),
    validado BOOLEAN DEFAULT FALSE,
    ultima_inspecao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_infraestruturas_geom ON infraestruturas USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_infraestruturas_categoria ON infraestruturas(id_categoria);
CREATE INDEX IF NOT EXISTS idx_infraestruturas_operacional ON infraestruturas(operacional);
-- Abrigos
CREATE TABLE IF NOT EXISTS abrigos (
    id_abrigo SERIAL PRIMARY KEY,
    id_infraestrutura INTEGER REFERENCES infraestruturas(id_infraestrutura),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('temporario', 'permanente', 'emergencia')),
    geometria GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    endereco TEXT,
    capacidade_maxima INTEGER NOT NULL,
    ocupacao_atual INTEGER DEFAULT 0,
    disponibilidade_percentual DECIMAL(5, 2),
    status VARCHAR(50) CHECK (
        status IN ('aberto', 'lotado', 'fechado', 'em_preparacao')
    ),
    condicao VARCHAR(50) CHECK (condicao IN ('otima', 'boa', 'regular', 'precaria')),
    tem_agua BOOLEAN DEFAULT FALSE,
    tem_energia BOOLEAN DEFAULT FALSE,
    tem_saneamento BOOLEAN DEFAULT FALSE,
    tem_cozinha BOOLEAN DEFAULT FALSE,
    tem_area_saude BOOLEAN DEFAULT FALSE,
    recursos JSONB,
    responsavel VARCHAR(200),
    telefone_contacto VARCHAR(50),
    data_abertura TIMESTAMP,
    data_encerramento TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_abrigos_geom ON abrigos USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_abrigos_distrito ON abrigos(id_distrito);
CREATE INDEX IF NOT EXISTS idx_abrigos_status ON abrigos(status);
-- Deslocados
CREATE TABLE IF NOT EXISTS deslocados (
    id_deslocado SERIAL PRIMARY KEY,
    id_abrigo INTEGER REFERENCES abrigos(id_abrigo),
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    nome_completo VARCHAR(200) NOT NULL,
    data_nascimento DATE,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    documento_identificacao VARCHAR(50),
    telefone VARCHAR(20),
    distrito_origem VARCHAR(100),
    localidade_origem VARCHAR(100),
    endereco_origem TEXT,
    vulneravel BOOLEAN DEFAULT FALSE,
    tipo_vulnerabilidade VARCHAR(100) [],
    necessidades_especiais TEXT,
    numero_acompanhantes INTEGER DEFAULT 0,
    nomes_acompanhantes TEXT [],
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_saida TIMESTAMP,
    distrito_destino VARCHAR(100),
    endereco_destino TEXT,
    status VARCHAR(50) CHECK (
        status IN ('ativo', 'saiu', 'transferido', 'falecido')
    ),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deslocados_abrigo ON deslocados(id_abrigo);
CREATE INDEX IF NOT EXISTS idx_deslocados_evento ON deslocados(id_evento);
CREATE INDEX IF NOT EXISTS idx_deslocados_status ON deslocados(status);