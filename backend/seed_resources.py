"""
Seed das categorias de recurso
"""
from resources.models import CategoriaRecurso

categorias = [
    ('AGUA',               'Agua Potavel',            'litros'),
    ('COMIDA',             'Alimentos',                'kg'),
    ('KIT_HIGIENE',        'Kits de Higiene',          'unidades'),
    ('COBERTOR',           'Cobertores',               'unidades'),
    ('LONA',               'Lonas',                    'unidades'),
    ('MEDICAMENTO',        'Medicamentos',             'kits'),
    ('ROUPA',              'Roupas',                   'kg'),
    ('MATERIAL_CONSTRUCAO','Material de Construcao',   'unidades'),
]

for cod, nome, unidade in categorias:
    obj, created = CategoriaRecurso.objects.get_or_create(
        codigo=cod,
        defaults={'nome': nome, 'unidade_medida': unidade}
    )
    print(f"{'Criado' if created else 'Existia'}: {cod}")

print(f"\nTotal: {CategoriaRecurso.objects.count()} categorias")