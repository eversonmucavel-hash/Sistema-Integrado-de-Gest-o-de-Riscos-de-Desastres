-- ============================================
-- SIGRD - Divisão Administrativa
-- ============================================
-- Províncias
CREATE TABLE IF NOT EXISTS provincias (
    id_provincia SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    capital VARCHAR(100),
    area_km2 DECIMAL(12, 2),
    populacao_estimada INTEGER,
    geometria GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provincias_geom ON provincias USING GIST(geometria);
-- Distritos
CREATE TABLE IF NOT EXISTS distritos (
    id_distrito SERIAL PRIMARY KEY,
    id_provincia INTEGER REFERENCES provincias(id_provincia),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    area_km2 DECIMAL(12, 2),
    populacao_estimada INTEGER,
    geometria GEOMETRY(MultiPolygon, 4326),
    nivel_risco VARCHAR(20) CHECK (
        nivel_risco IN ('baixo', 'medio', 'alto', 'critico')
    ),
    ultima_avaliacao_risco DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_distritos_geom ON distritos USING GIST(geometria);
CREATE INDEX IF NOT EXISTS idx_distritos_risco ON distritos(nivel_risco);
-- Postos Administrativos
CREATE TABLE IF NOT EXISTS postos_administrativos (
    id_posto SERIAL PRIMARY KEY,
    id_distrito INTEGER REFERENCES distritos(id_distrito),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    geometria GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_postos_geom ON postos_administrativos USING GIST(geometria);
-- Localidades
CREATE TABLE IF NOT EXISTS localidades (
    id_localidade SERIAL PRIMARY KEY,
    id_posto INTEGER REFERENCES postos_administrativos(id_posto),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    populacao_estimada INTEGER,
    geometria GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_localidades_geom ON localidades USING GIST(geometria);