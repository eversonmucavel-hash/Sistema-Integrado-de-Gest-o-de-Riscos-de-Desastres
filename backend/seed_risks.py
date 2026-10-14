"""
Seed dos tipos de risco
Uso: python manage.py shell < seed_risks.py
"""
from risks.models import TipoRisco

tipos = [
    ('CICLONE',      'Ciclone Tropical',      '#FF0000', 'cyclone'),
    ('CHEIA',        'Cheia/Inundacao',       '#0000FF', 'flood'),
    ('SECA',         'Seca',                  '#FFA500', 'drought'),
    ('INCENDIO',     'Incendio Florestal',    '#FF6600', 'fire'),
    ('EROSAO',       'Erosao Costeira',       '#8B4513', 'erosion'),
    ('DESLIZAMENTO', 'Deslizamento de Terra', '#A0522D', 'landslide'),
    ('SISMO',        'Sismo',                 '#800080', 'earthquake'),
]

for cod, nome, cor, icone in tipos:
    obj, created = TipoRisco.objects.get_or_create(
        codigo=cod,
        defaults={'nome': nome, 'cor_mapa': cor, 'icone': icone}
    )
    print(f"{'Criado' if created else 'Existia'}: {cod}")

print(f"\nTotal: {TipoRisco.objects.count()} tipos de risco")

