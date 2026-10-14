-- ============================================
-- SIGRD - Dados Iniciais (Moçambique)
-- ============================================
-- Províncias de Moçambique (11 províncias)
INSERT INTO provincias (
        codigo,
        nome,
        capital,
        area_km2,
        populacao_estimada
    )
VALUES (
        'MZ-MPM',
        'Maputo Cidade',
        'Maputo',
        347,
        1120000
    ),
    (
        'MZ-MAP',
        'Maputo Província',
        'Matola',
        22693,
        1900000
    ),
    (
        'MZ-GAZ',
        'Gaza',
        'Xai-Xai',
        75709,
        1500000
    ),
    (
        'MZ-INH',
        'Inhambane',
        'Inhambane',
        68615,
        1500000
    ),
    (
        'MZ-SOF',
        'Sofala',
        'Beira',
        68018,
        2200000
    ),
    (
        'MZ-MAN',
        'Manica',
        'Chimoio',
        61661,
        2000000
    ),
    (
        'MZ-TET',
        'Tete',
        'Tete',
        100724,
        2900000
    ),
    (
        'MZ-ZAM',
        'Zambézia',
        'Quelimane',
        103478,
        5500000
    ),
    (
        'MZ-NAM',
        'Nampula',
        'Nampula',
        81606,
        6100000
    ),
    (
        'MZ-CAB',
        'Cabo Delgado',
        'Pemba',
        82625,
        2400000
    ),
    (
        'MZ-NIA',
        'Niassa',
        'Lichinga',
        129056,
        1900000
    ) ON CONFLICT (codigo) DO NOTHING;
-- Alguns distritos de alto risco (exemplo)
INSERT INTO distritos (
        id_provincia,
        codigo,
        nome,
        area_km2,
        populacao_estimada,
        nivel_risco
    )
SELECT p.id_provincia,
    'D-' || UPPER(
        SUBSTRING(
            d.nome
            FROM 1 FOR 3
        )
    ) || '-001',
    d.nome,
    d.area,
    d.pop,
    d.risco
FROM (
        VALUES (
                'MZ-SOF',
                'Beira',
                633,
                530000,
                'critico'
            ),
            (
                'MZ-SOF',
                'Búzi',
                2300,
                165000,
                'critico'
            ),
            ('MZ-SOF', 'Nhamatanda', 3800, 210000, 'alto'),
            (
                'MZ-ZAM',
                'Quelimane',
                1070,
                350000,
                'critico'
            ),
            ('MZ-ZAM', 'Mopeia', 3800, 130000, 'alto'),
            (
                'MZ-GAZ',
                'Chókwè',
                2164,
                200000,
                'critico'
            ),
            ('MZ-GAZ', 'Xai-Xai', 1234, 130000, 'alto'),
            (
                'MZ-NAM',
                'Nampula',
                1300,
                750000,
                'medio'
            ),
            ('MZ-TET', 'Tete', 1500, 350000, 'alto'),
            ('MZ-CAB', 'Pemba', 300, 200000, 'alto')
    ) AS d(prov, nome, area, pop, risco)
    JOIN provincias p ON p.codigo = d.prov ON CONFLICT (codigo) DO NOTHING;
-- Confirmar
SELECT 'Províncias:' AS tabela,
    COUNT(*) AS total
FROM provincias
UNION ALL
SELECT 'Distritos:',
    COUNT(*)
FROM distritos
UNION ALL
SELECT 'Tipos de Risco:',
    COUNT(*)
FROM tipos_risco;