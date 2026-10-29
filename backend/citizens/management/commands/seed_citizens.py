"""
SIGRD - Seed de cidadãos de teste
Distribui cidadãos fictícios pelas zonas de risco de Moçambique
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from geography.models import Distrito
from citizens.models import PessoaRegistada


NOMES_MASCULINOS = [
    'João', 'José', 'Manuel', 'António', 'Carlos', 'Pedro', 'Paulo', 'Luís',
    'Fernando', 'Ricardo', 'Alberto', 'Miguel', 'Armando', 'Tomás', 'Salomão',
    'Ernesto', 'Américo', 'Baltazar', 'Custódio', 'Domingos',
]

NOMES_FEMININOS = [
    'Maria', 'Ana', 'Joana', 'Beatriz', 'Carla', 'Sofia', 'Isabel', 'Rosa',
    'Filomena', 'Esperança', 'Amélia', 'Cecília', 'Fernanda', 'Luísa',
    'Vitória', 'Amália', 'Graça', 'Fátima', 'Helena', 'Conceição',
]

APELIDOS = [
    'Silva', 'Santos', 'Costa', 'Pereira', 'Almeida', 'Rodrigues', 'Mabote',
    'Machel', 'Chissano', 'Guebuza', 'Nyusi', 'Mondlane', 'Sitoe', 'Cossa',
    'Macuácua', 'Nhantumbo', 'Tembe', 'Massingue', 'Bila', 'Uamusse',
]

VULNERABILIDADES = [
    'idoso', 'crianca', 'gestante', 'deficiente', 'doente_cronico',
]

# Bairros fictícios por distrito (nome, lat, lng)
BAIRROS = {
    'Beira': [
        ('Bairro Macúti', -19.8300, 34.8400),
        ('Bairro Munhava', -19.8200, 34.8600),
        ('Bairro Chota', -19.8100, 34.8300),
        ('Bairro Esturro', -19.8450, 34.8250),
    ],
    'Buzi': [
        ('Bairro Central', -19.8600, 34.4000),
        ('Bairro Nhaconjo', -19.8500, 34.4200),
        ('Bairro Inhamuchindo', -19.8700, 34.3800),
    ],
    'Chokwe': [
        ('Bairro Josina Machel', -24.5400, 33.0200),
        ('Bairro Macia', -24.5300, 33.0100),
        ('Bairro Chilembene', -24.5200, 33.0400),
    ],
    'Quelimane': [
        ('Bairro Chuabo Dembe', -17.8800, 36.9000),
        ('Bairro Zalala', -17.8700, 36.9100),
        ('Bairro Murropué', -17.8900, 36.8800),
    ],
    'Nhamatanda': [
        ('Bairro Sede', -19.4600, 34.3600),
        ('Bairro Metuchira', -19.4500, 34.3500),
    ],
}

# Quantos cidadãos criar por distrito
QTD_POR_DISTRITO = {
    'Beira': 30,
    'Buzi': 25,
    'Chokwe': 20,
    'Quelimane': 15,
    'Nhamatanda': 10,
}


class Command(BaseCommand):
    help = 'Popula a base de dados com cidadãos registados de teste'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpar',
            action='store_true',
            help='Apaga cidadãos existentes antes de criar novos',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('SIGRD - Seed de Cidadaos'))
        self.stdout.write(self.style.WARNING('=' * 60))

        if options['limpar']:
            total = PessoaRegistada.objects.count()
            PessoaRegistada.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'\nApagados {total} cidadaos anteriores'))

        total_criados = 0

        for distrito_nome, qtd in QTD_POR_DISTRITO.items():
            distrito = Distrito.objects.filter(nome__iexact=distrito_nome).first()
            if not distrito:
                self.stdout.write(self.style.ERROR(
                    f'\n[AVISO] Distrito {distrito_nome} nao encontrado'
                ))
                continue

            bairros = BAIRROS.get(distrito_nome, [])
            if not bairros:
                continue

            self.stdout.write(f'\nA criar {qtd} cidadaos em {distrito_nome}...')
            criados = 0

            for i in range(qtd):
                # Nome
                sexo = random.choice(['M', 'F'])
                primeiro_nome = random.choice(
                    NOMES_MASCULINOS if sexo == 'M' else NOMES_FEMININOS
                )
                apelido = random.choice(APELIDOS)
                nome_completo = f'{primeiro_nome} {apelido}'

                # Telefone (prefixo moçambicano +25884 ou +25887)
                prefixo = random.choice(['84', '87'])
                numero = f'+258{prefixo}{random.randint(1000000, 9999999)}'

                # Bairro + coordenadas
                bairro, lat_base, lng_base = random.choice(bairros)
                # Pequeno offset para variar
                lat = lat_base + random.uniform(-0.01, 0.01)
                lng = lng_base + random.uniform(-0.01, 0.01)

                # Vulnerabilidade (30% chance)
                vulneravel = random.random() < 0.30
                tipos_vuln = []
                if vulneravel:
                    tipos_vuln = random.sample(
                        VULNERABILIDADES,
                        k=random.randint(1, 2)
                    )

                # Canais preferidos
                canais = ['SMS']
                if random.random() < 0.4:
                    canais.append('APP')

                # Idade
                idade = random.randint(1, 85)

                from datetime import date, timedelta
                data_nasc = date.today() - timedelta(days=idade * 365)

                try:
                    pessoa = PessoaRegistada.objects.create(
                        nome_completo=nome_completo,
                        data_nascimento=data_nasc,
                        sexo=sexo,
                        telefone_principal=numero,
                        distrito=distrito,
                        endereco=bairro,
                        latitude=lat,
                        longitude=lng,
                        geometria=Point(lng, lat, srid=4326),
                        pessoa_vulneravel=vulneravel,
                        tipo_vulnerabilidade=tipos_vuln,
                        canais_preferidos=canais,
                        receber_alertas=True,
                        ativo=True,
                        validado=random.random() < 0.7,
                        origem_registo='importacao',
                    )
                    criados += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  Erro: {e}'))

            total_criados += criados
            self.stdout.write(self.style.SUCCESS(f'  {criados} cidadaos criados'))

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(
            f'Total: {total_criados} cidadaos criados'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Total na BD: {PessoaRegistada.objects.count()}'
        ))
        self.stdout.write('=' * 60)