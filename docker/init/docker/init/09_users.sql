-- ============================================
-- SIGRD - Usuários e Permissões
-- ============================================
CREATE TABLE IF NOT EXISTS perfis_usuario (
    id_perfil SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    nivel_acesso INTEGER CHECK (
        nivel_acesso BETWEEN 1 AND 10
    )
);
INSERT INTO perfis_usuario (codigo, nome, nivel_acesso)
VALUES (
        'ADMIN',
        'Administrador do Sistema',
        10
    ),
    (
        'GESTOR_NACIONAL',
        'Gestor INGD Nacional',
        9
    ),
    (
        'GESTOR_PROVINCIAL',
        'Gestor Provincial',
        7
    ),
    (
        'GESTOR_DISTRITAL',
        'Gestor Distrital',
        5
    ),
    (
        'COORDENADOR_CAMPO',
        'Coordenador de Campo',
        4
    ),
    (
        'AGENTE_CAMPO',
        'Agente de Campo',
        3
    ),
    (
        'VISUALIZADOR',
        'Visualizador Público',
        1
    ) ON CONFLICT (codigo) DO NOTHING;
-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_perfil INTEGER REFERENCES perfis_usuario(id_perfil),
    nome_completo VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(50),
    senha_hash VARCHAR(255) NOT NULL,
    token_recuperacao VARCHAR(255),
    token_expiracao TIMESTAMP,
    id_provincia INTEGER REFERENCES provincias(id_provincia),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    instituicao VARCHAR(200),
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(id_perfil);
-- Pessoas Registadas (para receber alertas)
CREATE TABLE IF NOT EXISTS pessoas_registradas (
    id_pessoa SERIAL PRIMARY KEY,
    nome_completo VARCHAR(200) NOT NULL,
    data_nascimento DATE,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    telefone_principal VARCHAR(20),
    telefone_alternativo VARCHAR(20),
    email VARCHAR(100),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    id_localidade INTEGER REFERENCES localidades(id_localidade),
    endereco TEXT,
    geometria GEOMETRY(Point, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    receber_alertas BOOLEAN DEFAULT TRUE,
    canais_preferidos VARCHAR(20) [],
    idioma_preferido VARCHAR(10) DEFAULT 'pt',
    pessoa_vulneravel BOOLEAN DEFAULT FALSE,
    tipo_vulnerabilidade VARCHAR(100) [],
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_pessoas_geom ON pessoas_registradas USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_pessoas_distrito ON pessoas_registradas(id_distrito);
-- Logs de Auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id_log BIGSERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(100),
    id_registro INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_auditoria(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_tabela ON logs_auditoria(tabela);