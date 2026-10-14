-- ============================================
-- SIGRD - Funções e Triggers
-- ============================================
-- Trigger: Calcular área/perímetro de áreas de risco
CREATE OR REPLACE FUNCTION calcular_area_perimetro() RETURNS TRIGGER AS $$ BEGIN NEW.area_m2 = ST_Area(NEW.geometria::geography);
NEW.perimetro_m = ST_Perimeter(NEW.geometria::geography);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_calcular_area_perimetro ON areas_risco;
CREATE TRIGGER trg_calcular_area_perimetro BEFORE
INSERT
    OR
UPDATE ON areas_risco FOR EACH ROW EXECUTE FUNCTION calcular_area_perimetro();
-- Trigger: Calcular centroide de áreas seguras
CREATE OR REPLACE FUNCTION calcular_centroide() RETURNS TRIGGER AS $$ BEGIN NEW.latitude = ST_Y(ST_Centroid(NEW.geometria));
NEW.longitude = ST_X(ST_Centroid(NEW.geometria));
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_calcular_centroide ON areas_seguras;
CREATE TRIGGER trg_calcular_centroide BEFORE
INSERT
    OR
UPDATE ON areas_seguras FOR EACH ROW EXECUTE FUNCTION calcular_centroide();
-- Trigger: Extrair coordenadas de infraestruturas
CREATE OR REPLACE FUNCTION extrair_coordenadas() RETURNS TRIGGER AS $$ BEGIN NEW.latitude = ST_Y(NEW.geometria);
NEW.longitude = ST_X(NEW.geometria);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_extrair_coordenadas ON infraestruturas;
CREATE TRIGGER trg_extrair_coordenadas BEFORE
INSERT
    OR
UPDATE ON infraestruturas FOR EACH ROW EXECUTE FUNCTION extrair_coordenadas();
-- Trigger: Calcular disponibilidade de abrigo
CREATE OR REPLACE FUNCTION calcular_disponibilidade_abrigo() RETURNS TRIGGER AS $$ BEGIN IF NEW.capacidade_maxima > 0 THEN NEW.disponibilidade_percentual = (
        (NEW.capacidade_maxima - NEW.ocupacao_atual)::DECIMAL / NEW.capacidade_maxima
    ) * 100;
IF NEW.ocupacao_atual >= NEW.capacidade_maxima THEN NEW.status = 'lotado';
ELSIF NEW.ocupacao_atual > 0
AND NEW.status != 'fechado' THEN NEW.status = 'aberto';
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_calcular_disponibilidade ON abrigos;
CREATE TRIGGER trg_calcular_disponibilidade BEFORE
INSERT
    OR
UPDATE ON abrigos FOR EACH ROW EXECUTE FUNCTION calcular_disponibilidade_abrigo();
-- Função: Encontrar abrigo mais próximo
CREATE OR REPLACE FUNCTION encontrar_abrigo_mais_proximo(
        p_latitude DECIMAL,
        p_longitude DECIMAL,
        p_raio_km DECIMAL DEFAULT 50
    ) RETURNS TABLE (
        id_abrigo INTEGER,
        nome VARCHAR,
        distancia_km DECIMAL,
        disponibilidade_percentual DECIMAL,
        latitude DECIMAL,
        longitude DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT a.id_abrigo,
    a.nome::VARCHAR,
    (
        ST_Distance(
            a.geometria::geography,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        ) / 1000
    )::DECIMAL AS distancia_km,
    a.disponibilidade_percentual,
    a.latitude,
    a.longitude
FROM abrigos a
WHERE a.status = 'aberto'
    AND a.ativo = TRUE
    AND ST_DWithin(
        a.geometria::geography,
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
        p_raio_km * 1000
    )
ORDER BY distancia_km ASC
LIMIT 5;
END;
$$ LANGUAGE plpgsql;
-- Função: Verificar se ponto está em área de risco
CREATE OR REPLACE FUNCTION verificar_area_risco(
        p_latitude DECIMAL,
        p_longitude DECIMAL
    ) RETURNS TABLE (
        em_risco BOOLEAN,
        areas_risco TEXT [],
        nivel_maximo VARCHAR
    ) AS $$
DECLARE v_ponto GEOMETRY;
BEGIN v_ponto := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326);
RETURN QUERY
SELECT COUNT(*) > 0,
    ARRAY_AGG(ar.nome_area)::TEXT [],
    MAX(ar.nivel_risco)::VARCHAR
FROM areas_risco ar
WHERE ST_Contains(ar.geometria, v_ponto)
    AND ar.ativo = TRUE;
END;
$$ LANGUAGE plpgsql;
-- Função: Gerar código de evento automático
CREATE OR REPLACE FUNCTION gerar_codigo_evento(
        p_tipo_risco VARCHAR,
        p_ano INTEGER DEFAULT EXTRACT(
            YEAR
            FROM CURRENT_DATE
        )::INTEGER
    ) RETURNS VARCHAR AS $$
DECLARE v_prefixo VARCHAR;
v_sequencial INTEGER;
v_codigo VARCHAR;
BEGIN v_prefixo := CASE
    p_tipo_risco
    WHEN 'CICLONE' THEN 'CYC'
    WHEN 'CHEIA' THEN 'CHE'
    WHEN 'SECA' THEN 'SEC'
    WHEN 'INCENDIO' THEN 'INC'
    ELSE 'EVT'
END;
SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(
                    codigo_evento
                    FROM '\d+$'
                ) AS INTEGER
            )
        ),
        0
    ) + 1 INTO v_sequencial
FROM eventos_desastre
WHERE codigo_evento LIKE v_prefixo || '-' || p_ano || '-%';
v_codigo := v_prefixo || '-' || p_ano || '-' || LPAD(v_sequencial::TEXT, 3, '0');
RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;
-- View: Resumo de riscos por distrito
CREATE OR REPLACE VIEW vw_resumo_riscos_distrito AS
SELECT d.id_distrito,
    d.codigo,
    d.nome AS distrito,
    p.nome AS provincia,
    d.nivel_risco,
    d.populacao_estimada,
    COUNT(DISTINCT ar.id_area_risco) AS total_areas_risco,
    COUNT(
        DISTINCT CASE
            WHEN ar.nivel_risco = 'critico' THEN ar.id_area_risco
        END
    ) AS areas_criticas,
    SUM(ar.populacao_exposta) AS total_populacao_exposta,
    COUNT(DISTINCT i.id_infraestrutura) AS total_infraestruturas,
    COUNT(
        DISTINCT CASE
            WHEN i.em_area_risco THEN i.id_infraestrutura
        END
    ) AS infraestruturas_em_risco,
    COUNT(DISTINCT aseg.id_area_segura) AS total_areas_seguras,
    SUM(aseg.capacidade_pessoas) AS capacidade_total_areas_seguras,
    COUNT(DISTINCT ab.id_abrigo) AS total_abrigos,
    SUM(ab.capacidade_maxima) AS capacidade_total_abrigos
FROM distritos d
    JOIN provincias p ON d.id_provincia = p.id_provincia
    LEFT JOIN areas_risco ar ON d.id_distrito = ar.id_distrito
    LEFT JOIN infraestruturas i ON d.id_distrito = i.id_distrito
    LEFT JOIN areas_seguras aseg ON d.id_distrito = aseg.id_distrito
    LEFT JOIN abrigos ab ON d.id_distrito = ab.id_distrito
GROUP BY d.id_distrito,
    d.codigo,
    d.nome,
    p.nome,
    d.nivel_risco,
    d.populacao_estimada;