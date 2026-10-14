"""
Seed das categorias de infraestrutura
"""
from shelters.models import CategoriaInfraestrutura

categorias = [
    ('ABRIGO',      'Centro de Acomodacao',     'shelter',      '#00FF00'),
    ('SAUDE',       'Centro de Saude',           'hospital',     '#FF0000'),
    ('ESCOLA',      'Escola',                    'school',       '#0000FF'),
    ('AGUA',        'Fonte de Agua',             'water',        '#00FFFF'),
    ('ENERGIA',     'Infraestrutura Energetica', 'power',        '#FFFF00'),
    ('COMUNICACAO', 'Torre de Comunicacao',      'antenna',      '#FF00FF'),
    ('PONTE',       'Ponte',                     'bridge',       '#808080'),
    ('ESTRADA',     'Estrada Principal',         'road',         '#000000'),
    ('POLICIA',     'Posto Policial',            'police',       '#000080'),
    ('BOMBEIROS',   'Quartel de Bombeiros',      'fire_station', '#FF4500'),
]

for cod, nome, icone, cor in categorias:
    obj, created = CategoriaInfraestrutura.objects.get_or_create(
        codigo=cod,
        defaults={'nome': nome, 'icone': icone, 'cor': cor}
    )
    print(f"{'Criado' if created else 'Existia'}: {cod}")

print(f"\nTotal: {CategoriaInfraestrutura.objects.count()} categorias")