-- SIGRD - Meteorologia
CREATE TABLE IF NOT EXISTS estacoes_meteorologicas (
    id_estacao SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50),
    geometria GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_m DECIMAL(8, 2),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    operacional BOOLEAN DEFAULT TRUE,
    ultima_leitura TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_estacoes_geom ON estacoes_meteorologicas USING GIST(geometria);
CREATE TABLE IF NOT EXISTS leituras_meteorologicas (
    id_leitura BIGSERIAL PRIMARY KEY,
    id_estacao INTEGER REFERENCES estacoes_meteorologicas(id_estacao),
    timestamp_leitura TIMESTAMP NOT NULL,
    temperatura_c DECIMAL(5, 2),
    umidade_percentual DECIMAL(5, 2),
    precipitacao_mm DECIMAL(8, 2),
    velocidade_vento_kmh DECIMAL(6, 2),
    direcao_vento_graus DECIMAL(6, 2),
    pressao_atmosferica_hpa DECIMAL(7, 2),
    precipitacao_24h_mm DECIMAL(8, 2),
    precipitacao_7dias_mm DECIMAL(8, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leituras_estacao ON leituras_meteorologicas(id_estacao);
CREATE INDEX IF NOT EXISTS idx_leituras_timestamp ON leituras_meteorologicas(timestamp_leitura);
CREATE TABLE IF NOT EXISTS pontos_medicao_rio (
    id_ponto SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    rio VARCHAR(200),
    geometria GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_m DECIMAL(8, 2),
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    nivel_alerta_m DECIMAL(6, 2),
    nivel_perigo_m DECIMAL(6, 2),
    operacional BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pontos_medicao_geom ON pontos_medicao_rio USING GIST(geometria);
CREATE TABLE IF NOT EXISTS medicoes_nivel_rio (
    id_medicao BIGSERIAL PRIMARY KEY,
    id_ponto INTEGER REFERENCES pontos_medicao_rio(id_ponto),
    timestamp_medicao TIMESTAMP NOT NULL,
    nivel_agua_m DECIMAL(6, 2) NOT NULL,
    vazao_m3_s DECIMAL(10, 2),
    status_alerta VARCHAR(20) CHECK (
        status_alerta IN (
            'normal',
            'atencao',
            'alerta',
            'perigo',
            'critico'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_medicoes_ponto ON medicoes_nivel_rio(id_ponto);
CREATE INDEX IF NOT EXISTS idx_medicoes_timestamp ON medicoes_nivel_rio(timestamp_medicao);
CREATE INDEX IF NOT EXISTS idx_medicoes_status ON medicoes_nivel_rio(status_alerta);
CREATE TABLE IF NOT EXISTS imagens_satelite (
    id_imagem SERIAL PRIMARY KEY,
    fonte VARCHAR(50),
    tipo VARCHAR(50),
    geometria GEOMETRY(Polygon, 4326) NOT NULL,
    area_km2 DECIMAL(15, 2),
    data_aquisicao TIMESTAMP NOT NULL,
    resolucao_metros DECIMAL(6, 2),
    cobertura_nuvens_percentual DECIMAL(5, 2),
    url_preview TEXT,
    url_download TEXT,
    url_wms TEXT,
    id_evento INTEGER REFERENCES eventos_desastre(id_evento),
    processada BOOLEAN DEFAULT FALSE,
    analise TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_imagens_geom ON imagens_satelite USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_imagens_data ON imagens_satelite(data_aquisicao);