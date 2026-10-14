-- ============================================
-- SIGRD - Recursos e Doações
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_recurso (
    id_categoria SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    unidade_medida VARCHAR(20)
);
INSERT INTO categorias_recurso (codigo, nome, unidade_medida)
VALUES (
        'AGUA',
        'Água Potável',
        'litros'
    ),
    (
        'COMIDA',
        'Alimentos',
        'kg'
    ),
    (
        'KIT_HIGIENE',
        'Kits de Higiene',
        'unidades'
    ),
    (
        'COBERTOR',
        'Cobertores',
        'unidades'
    ),
    (
        'LONA',
        'Lonas',
        'unidades'
    ),
    (
        'MEDICAMENTO',
        'Medicamentos',
        'kits'
    ),
    (
        'ROUPA',
        'Roupas',
        'kg'
    ),
    (
        'MATERIAL_CONSTRUCAO',
        'Material de Construção',
        'unidades'
    ) ON CONFLICT (codigo) DO NOTHING;
-- Recursos
CREATE TABLE IF NOT EXISTS recursos (
    id_recurso SERIAL PRIMARY KEY,
    id_categoria INTEGER REFERENCES categorias_recurso(id_categoria),
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    quantidade_disponivel DECIMAL(15, 2),
    quantidade_alocada DECIMAL(15, 2) DEFAULT 0,
    quantidade_distribuida DECIMAL(15, 2) DEFAULT 0,
    unidade_medida VARCHAR(20),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    local_armazenamento TEXT,
    geometria GEOMETRY(Point, 4326),
    data_validade DATE,
    doador VARCHAR(200),
    tipo_doador VARCHAR(50),
    valor_estimado_mt DECIMAL(15, 2),
    data_recepcao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (
        status IN ('disponivel', 'alocado', 'distribuido', 'expirado')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recursos_categoria ON recursos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_recursos_evento ON recursos(id_evento);
CREATE INDEX IF NOT EXISTS idx_recursos_status ON recursos(status);
-- Distribuições
CREATE TABLE IF NOT EXISTS distribuicoes (
    id_distribuicao SERIAL PRIMARY KEY,
    id_recurso INTEGER REFERENCES recursos(id_recurso),
    id_abrigo INTEGER REFERENCES abrigos(id_abrigo),
    id_equipa INTEGER REFERENCES equipas_resposta(id_equipa),
    id_missao INTEGER REFERENCES missoes(id_missao),
    quantidade DECIMAL(15, 2) NOT NULL,
    unidade_medida VARCHAR(20),
    numero_beneficiarios INTEGER,
    data_distribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responsavel_nome VARCHAR(200),
    responsavel_telefone VARCHAR(50),
    comprovante_foto TEXT,
    assinatura_digital TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_distribuicoes_recurso ON distribuicoes(id_recurso);
CREATE INDEX IF NOT EXISTS idx_distribuicoes_abrigo ON distribuicoes(id_abrigo);
CREATE INDEX IF NOT EXISTS idx_distribuicoes_data ON distribuicoes(data_distribuicao);