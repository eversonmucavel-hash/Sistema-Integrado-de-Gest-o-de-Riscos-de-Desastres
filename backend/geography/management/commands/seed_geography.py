"""
SIGRD - Popular províncias e distritos de Moçambique
Uso: python manage.py seed_geography
"""
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon, MultiPolygon
from geography.models import Provincia, Distrito


class Command(BaseCommand):
    help = 'Popula provincias e distritos de Mocambique'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('A limpar tabelas...'))
        Distrito.objects.all().delete()
        Provincia.objects.all().delete()

        self.stdout.write(self.style.WARNING('A criar provincias...'))

        provincias_data = [
            ('MZ-MPM', 'Maputo Cidade',   'Maputo',    347,    1120000),
            ('MZ-MAP', 'Maputo Provincia','Matola',   22693,   1900000),
            ('MZ-GAZ', 'Gaza',            'Xai-Xai',  75709,   1500000),
            ('MZ-INH', 'Inhambane',       'Inhambane',68615,   1500000),
            ('MZ-SOF', 'Sofala',          'Beira',    68018,   2200000),
            ('MZ-MAN', 'Manica',          'Chimoio',  61661,   2000000),
            ('MZ-TET', 'Tete',            'Tete',    100724,   2900000),
            ('MZ-ZAM', 'Zambezia',        'Quelimane',103478,  5500000),
            ('MZ-NAM', 'Nampula',         'Nampula',  81606,   6100000),
            ('MZ-CAB', 'Cabo Delgado',    'Pemba',    82625,   2400000),
            ('MZ-NIA', 'Niassa',          'Lichinga',129056,   1900000),
        ]

        for codigo, nome, capital, area, pop in provincias_data:
            # Geometria placeholder (poligono pequeno)
            p = Polygon(((0, 0), (0, 1), (1, 1), (1, 0), (0, 0)), srid=4326)
            Provincia.objects.create(
                codigo=codigo,
                nome=nome,
                capital=capital,
                area_km2=area,
                populacao_estimada=pop,
                geometria=MultiPolygon(p, srid=4326),
            )

        self.stdout.write(self.style.SUCCESS(f'OK: {Provincia.objects.count()} provincias criadas'))

        self.stdout.write(self.style.WARNING('A criar distritos de alto risco...'))

        distritos_data = [
            ('MZ-SOF', 'D-BEI-001', 'Beira',       633,    530000, 'critico'),
            ('MZ-SOF', 'D-BUZ-001', 'Buzi',       2300,    165000, 'critico'),
            ('MZ-SOF', 'D-NHA-001', 'Nhamatanda', 3800,    210000, 'alto'),
            ('MZ-ZAM', 'D-QUE-001', 'Quelimane',  1070,    350000, 'critico'),
            ('MZ-ZAM', 'D-MOP-001', 'Mopeia',     3800,    130000, 'alto'),
            ('MZ-GAZ', 'D-CHO-001', 'Chokwe',     2164,    200000, 'critico'),
            ('MZ-GAZ', 'D-XAI-001', 'Xai-Xai',    1234,    130000, 'alto'),
            ('MZ-NAM', 'D-NAM-001', 'Nampula',    1300,    750000, 'medio'),
            ('MZ-TET', 'D-TET-001', 'Tete',       1500,    350000, 'alto'),
            ('MZ-CAB', 'D-PEM-001', 'Pemba',       300,    200000, 'alto'),
        ]

        for prov_codigo, codigo, nome, area, pop, risco in distritos_data:
            try:
                provincia = Provincia.objects.get(codigo=prov_codigo)
                p = Polygon(((0, 0), (0, 1), (1, 1), (1, 0), (0, 0)), srid=4326)
                Distrito.objects.create(
                    provincia=provincia,
                    codigo=codigo,
                    nome=nome,
                    area_km2=area,
                    populacao_estimada=pop,
                    nivel_risco=risco,
                    geometria=MultiPolygon(p, srid=4326),
                )
            except Provincia.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Provincia {prov_codigo} nao encontrada'))

        self.stdout.write(self.style.SUCCESS(f'OK: {Distrito.objects.count()} distritos criados'))
        self.stdout.write(self.style.SUCCESS('SEED COMPLETO!'))