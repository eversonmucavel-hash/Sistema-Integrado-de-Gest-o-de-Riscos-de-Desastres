"""
SIGRD - Comando de povoamento da base de dados
Uso: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point, Polygon
from datetime import datetime, timedelta
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Popula a base de dados SIGRD com dados de teste'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('SIGRD - A povoar base de dados'))
        self.stdout.write(self.style.WARNING('=' * 60))

        # Imports
        from geography.models import Distrito
        from risks.models import TipoRisco, AreaRisco, AreaSegura
        from shelters.models import CategoriaInfraestrutura, Infraestrutura, Abrigo
        from teams.models import TipoEquipa, EquipaResposta
        from resources.models import CategoriaRecurso, Recurso
        from alerts.models import Alerta
        from incidents.models import EventoDesastre

        # ============================================
        # 0. LIMPAR
        # ============================================
        self.stdout.write('\n[0/9] A limpar dados antigos...')
        Alerta.objects.all().delete()
        EventoDesastre.objects.all().delete()
        Recurso.objects.all().delete()
        EquipaResposta.objects.all().delete()
        Abrigo.objects.all().delete()
        Infraestrutura.objects.all().delete()
        AreaSegura.objects.all().delete()
        AreaRisco.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('   OK'))

        # ============================================
        # 1. CATEGORIAS DE INFRAESTRUTURA
        # ============================================
        self.stdout.write('\n[1/9] A garantir categorias de infraestrutura...')
        cats_infra = [
            ('ABRIGO',      'Centro de Acomodação',    'shelter',      '#00FF00'),
            ('SAUDE',       'Centro de Saúde',         'hospital',     '#FF0000'),
            ('ESCOLA',      'Escola',                  'school',       '#0000FF'),
            ('AGUA',        'Fonte de Água',           'water',        '#00FFFF'),
            ('ENERGIA',     'Infraestrutura Energética','power',       '#FFFF00'),
            ('COMUNICACAO', 'Torre de Comunicação',    'antenna',      '#FF00FF'),
            ('PONTE',       'Ponte',                   'bridge',       '#808080'),
            ('ESTRADA',     'Estrada Principal',       'road',         '#000000'),
            ('POLICIA',     'Posto Policial',          'police',       '#000080'),
            ('BOMBEIROS',   'Quartel de Bombeiros',    'fire_station', '#FF4500'),
        ]
        for codigo, nome, icone, cor in cats_infra:
            CategoriaInfraestrutura.objects.get_or_create(
                codigo=codigo,
                defaults={'nome': nome, 'icone': icone, 'cor': cor}
            )
        self.stdout.write(self.style.SUCCESS(f'   {CategoriaInfraestrutura.objects.count()} categorias'))

        # ============================================
        # 2. TIPOS DE EQUIPA
        # ============================================
        self.stdout.write('\n[2/9] A garantir tipos de equipa...')
        tipos_eq = [
            ('BUSCA_SALVAMENTO', 'Busca e Salvamento'),
            ('SAUDE',            'Equipa Médica'),
            ('DISTRIBUICAO',     'Distribuição de Ajuda'),
            ('AVALIACAO',        'Avaliação de Danos'),
            ('EVACUACAO',        'Equipa de Evacuação'),
            ('COMUNICACAO',      'Comunicação e Coordenação'),
        ]
        for codigo, nome in tipos_eq:
            TipoEquipa.objects.get_or_create(codigo=codigo, defaults={'nome': nome})
        self.stdout.write(self.style.SUCCESS(f'   {TipoEquipa.objects.count()} tipos'))

        # ============================================
        # 3. INFRAESTRUTURAS
        # ============================================
        self.stdout.write('\n[3/9] A criar infraestruturas...')

        cat_escola = CategoriaInfraestrutura.objects.get(codigo='ESCOLA')
        cat_saude = CategoriaInfraestrutura.objects.get(codigo='SAUDE')
        cat_agua = CategoriaInfraestrutura.objects.get(codigo='AGUA')

        beira = Distrito.objects.filter(nome__iexact='Beira').first()
        buzi = Distrito.objects.filter(nome__iexact='Buzi').first()
        quelimane = Distrito.objects.filter(nome__iexact='Quelimane').first()
        chokwe = Distrito.objects.filter(nome__iexact='Chokwe').first()
        nhamatanda = Distrito.objects.filter(nome__iexact='Nhamatanda').first()

        infraestruturas_data = [
            ("Escola Primária da Beira", cat_escola, beira, -19.8300, 34.8400, 500),
            ("Hospital Central da Beira", cat_saude, beira, -19.8250, 34.8450, 300),
            ("Escola Secundária de Búzi", cat_escola, buzi, -19.8500, 34.4000, 400),
            ("Centro de Saúde de Búzi", cat_saude, buzi, -19.8550, 34.4050, 100),
            ("Escola de Quelimane", cat_escola, quelimane, -17.8800, 36.8900, 600),
            ("Hospital Provincial de Quelimane", cat_saude, quelimane, -17.8750, 36.8850, 250),
            ("Escola de Chókwè", cat_escola, chokwe, -24.5300, 33.0100, 350),
            ("Centro de Saúde de Chókwè", cat_saude, chokwe, -24.5350, 33.0150, 120),
            ("Furo de Água Comunitário - Búzi", cat_agua, buzi, -19.8600, 34.4100, 1000),
            ("Furo de Água - Nhamatanda", cat_agua, nhamatanda, -19.4500, 34.3500, 800),
        ]

        count_infra = 0
        for nome, cat, dist, lat, lng, cap in infraestruturas_data:
            if dist:
                Infraestrutura.objects.create(
                    categoria=cat,
                    distrito=dist,
                    nome=nome,
                    geometria=Point(lng, lat, srid=4326),
                    capacidade_pessoas=cap,
                    operacional=True,
                    condicao='boa',
                    validado=True,
                )
                count_infra += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_infra} infraestruturas'))

        # ============================================
        # 4. ABRIGOS
        # ============================================
        self.stdout.write('\n[4/9] A criar abrigos...')

        abrigos_data = [
            ("Abrigo Municipal da Beira", beira, -19.8350, 34.8500, 500, 'permanente'),
            ("Abrigo Escola Búzi", buzi, -19.8600, 34.4200, 300, 'temporario'),
            ("Abrigo Comunitário de Chókwè", chokwe, -24.5400, 33.0200, 400, 'permanente'),
            ("Abrigo Quelimane Centro", quelimane, -17.8900, 36.9000, 600, 'permanente'),
            ("Abrigo Nhamatanda 1", nhamatanda, -19.4600, 34.3600, 250, 'temporario'),
        ]

        count_abrigos = 0
        for nome, dist, lat, lng, cap, tipo in abrigos_data:
            if dist:
                Abrigo.objects.create(
                    distrito=dist,
                    nome=nome,
                    tipo=tipo,
                    geometria=Point(lng, lat, srid=4326),
                    capacidade_maxima=cap,
                    ocupacao_atual=random.randint(0, int(cap * 0.6)),
                    status='aberto',
                    condicao='boa',
                    tem_agua=True,
                    tem_energia=True,
                    tem_saneamento=True,
                    responsavel='Coordenador INGD',
                    telefone_contacto='+258840000000',
                    ativo=True,
                )
                count_abrigos += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_abrigos} abrigos'))

        # ============================================
        # 5. ÁREAS DE RISCO
        # ============================================
        self.stdout.write('\n[5/9] A criar áreas de risco...')

        tipo_ciclone = TipoRisco.objects.get(codigo='CICLONE')
        tipo_cheia = TipoRisco.objects.get(codigo='CHEIA')
        tipo_seca = TipoRisco.objects.get(codigo='SECA')
        tipo_erosao = TipoRisco.objects.get(codigo='EROSAO')

        def criar_poligono(lat, lng, tamanho=0.05):
            coords = [
                (lng - tamanho, lat - tamanho),
                (lng + tamanho, lat - tamanho),
                (lng + tamanho, lat + tamanho),
                (lng - tamanho, lat + tamanho),
                (lng - tamanho, lat - tamanho),
            ]
            return Polygon(coords, srid=4326)

        areas_risco_data = [
            ("Zona Costeira da Beira", tipo_ciclone, beira, -19.8400, 34.8500, "critico", 50000),
            ("Bacia do Búzi - Zona Baixa", tipo_cheia, buzi, -19.8600, 34.4000, "critico", 30000),
            ("Zona Ribeirinha de Chókwè", tipo_cheia, chokwe, -24.5400, 33.0100, "alto", 25000),
            ("Zona Baixa de Quelimane", tipo_cheia, quelimane, -17.8900, 36.8900, "alto", 20000),
            ("Zona de Seca - Interior de Gaza", tipo_seca, chokwe, -24.5000, 33.0500, "medio", 15000),
            ("Erosão Costeira - Beira Norte", tipo_erosao, beira, -19.8100, 34.8600, "alto", 10000),
        ]

        count_areas = 0
        for nome, tipo, dist, lat, lng, nivel, pop in areas_risco_data:
            if dist:
                AreaRisco.objects.create(
                    distrito=dist,
                    tipo_risco=tipo,
                    nome_area=nome,
                    geometria=criar_poligono(lat, lng),
                    nivel_risco=nivel,
                    probabilidade='provavel',
                    impacto='grave',
                    populacao_exposta=pop,
                    familias_expostas=pop // 5,
                    escolas_em_risco=random.randint(1, 5),
                    centros_saude_em_risco=random.randint(0, 2),
                    habitacoes_em_risco=random.randint(50, 500),
                    validado=True,
                    fonte_dados='Satélite',
                    ativo=True,
                )
                count_areas += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_areas} áreas de risco'))

        # ============================================
        # 6. ÁREAS SEGURAS
        # ============================================
        self.stdout.write('\n[6/9] A criar áreas seguras...')

        areas_seguras_data = [
            ("Zona Alta da Beira", beira, -19.8200, 34.8300, 5000),
            ("Zona Alta de Búzi", buzi, -19.8400, 34.3800, 3000),
            ("Zona Alta de Chókwè", chokwe, -24.5100, 33.0000, 4000),
        ]

        count_seguras = 0
        for nome, dist, lat, lng, cap in areas_seguras_data:
            if dist:
                AreaSegura.objects.create(
                    distrito=dist,
                    nome=nome,
                    tipo='zona_alta',
                    geometria=criar_poligono(lat, lng, tamanho=0.03),
                    capacidade_pessoas=cap,
                    tem_agua_potavel=True,
                    tem_energia=True,
                    tem_comunicacao=True,
                    tem_saneamento=True,
                    validado=True,
                    ativo=True,
                )
                count_seguras += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_seguras} áreas seguras'))

        # ============================================
        # 7. EQUIPAS
        # ============================================
        self.stdout.write('\n[7/9] A criar equipas de resposta...')

        tipo_busca = TipoEquipa.objects.filter(codigo='BUSCA_SALVAMENTO').first()
        tipo_saude_eq = TipoEquipa.objects.filter(codigo='SAUDE').first()
        tipo_aval = TipoEquipa.objects.filter(codigo='AVALIACAO').first()

        equipas_data = [
            ("Equipa INGD - Beira", tipo_busca, "INGD", beira, -19.8300, 34.8400, 8),
            ("Equipa INGD - Búzi", tipo_busca, "INGD", buzi, -19.8600, 34.4000, 6),
            ("Equipa Cruz Vermelha - Beira", tipo_saude_eq, "Cruz Vermelha", beira, -19.8350, 34.8500, 10),
            ("Equipa Bombeiros - Quelimane", tipo_busca, "Bombeiros", quelimane, -17.8800, 36.8900, 12),
            ("Equipa Avaliação - Chókwè", tipo_aval, "INGD", chokwe, -24.5300, 33.0100, 5),
        ]

        count_equipas = 0
        for idx, (nome, tipo, inst, dist, lat, lng, membros) in enumerate(equipas_data, start=1):
            if dist and tipo:
                EquipaResposta.objects.create(
                    tipo_equipa=tipo,
                    codigo_equipa=f"EQ-2026-{idx:03d}",
                    nome=nome,
                    instituicao=inst,
                    lider_nome=f"Líder {idx}",
                    lider_telefone='+258840000000',
                    numero_membros=membros,
                    geometria=Point(lng, lat, srid=4326),
                    distrito_atuacao=dist,
                    status='standby',
                    ativo=True,
                )
                count_equipas += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_equipas} equipas'))

        # ============================================
        # 8. RECURSOS
        # ============================================
        self.stdout.write('\n[8/9] A criar recursos...')

        cat_agua_rec = CategoriaRecurso.objects.get(codigo='AGUA')
        cat_comida = CategoriaRecurso.objects.get(codigo='COMIDA')
        cat_kit = CategoriaRecurso.objects.get(codigo='KIT_HIGIENE')
        cat_cobertor = CategoriaRecurso.objects.get(codigo='COBERTOR')

        recursos_data = [
            ("Água Potável - Armazém Beira", cat_agua_rec, 50000, beira, "litros", "UNICEF"),
            ("Arroz - Armazém Beira", cat_comida, 10000, beira, "kg", "WFP"),
            ("Kits Higiene - Beira", cat_kit, 2000, beira, "unidades", "UNICEF"),
            ("Cobertores - Beira", cat_cobertor, 3000, beira, "unidades", "Cruz Vermelha"),
            ("Água - Búzi", cat_agua_rec, 20000, buzi, "litros", "Governo"),
            ("Alimentos - Búzi", cat_comida, 5000, buzi, "kg", "WFP"),
            ("Kits Higiene - Quelimane", cat_kit, 1500, quelimane, "unidades", "ONG Local"),
            ("Água - Chókwè", cat_agua_rec, 15000, chokwe, "litros", "Governo"),
        ]

        count_recursos = 0
        for nome, cat, qtd, dist, unidade, doador in recursos_data:
            if dist:
                Recurso.objects.create(
                    categoria=cat,
                    nome=nome,
                    quantidade_disponivel=Decimal(qtd),
                    unidade_medida=unidade,
                    distrito=dist,
                    local_armazenamento='Armazém Central',
                    doador=doador,
                    tipo_doador='Internacional',
                    status='disponivel',
                )
                count_recursos += 1
        self.stdout.write(self.style.SUCCESS(f'   {count_recursos} recursos'))

        # ============================================
        # 9. EVENTOS + ALERTAS
        # ============================================
        self.stdout.write('\n[9/9] A criar eventos e alertas...')

        evento1 = EventoDesastre.objects.create(
            codigo_evento='CYC-2026-001',
            tipo_risco=tipo_ciclone,
            nome='Ciclone Freddy (Simulação)',
            descricao='Ciclone tropical de categoria 4 que afetou a zona centro',
            categoria='4',
            intensidade='extrema',
            data_inicio=datetime.now() - timedelta(days=30),
            data_fim=datetime.now() - timedelta(days=25),
            ativo=False,
            nivel_alerta='vermelho',
            estado_resposta='recuperacao',
            pessoas_afetadas=150000,
            pessoas_deslocadas=25000,
            mortes=50,
            feridos=200,
            habitacoes_destruidas=5000,
            habitacoes_danificadas=15000,
            coordenador_responsavel='Coordenador Nacional INGD',
            cenoe_ativado=True,
            fonte_informacao='INAM',
        )

        evento2 = EventoDesastre.objects.create(
            codigo_evento='CHE-2026-001',
            tipo_risco=tipo_cheia,
            nome='Cheias na Bacia do Búzi',
            descricao='Cheias sazonais devido a chuvas intensas',
            intensidade='alta',
            data_inicio=datetime.now() - timedelta(days=10),
            ativo=True,
            nivel_alerta='laranja',
            estado_resposta='emergencia',
            pessoas_afetadas=30000,
            pessoas_deslocadas=5000,
            mortes=5,
            feridos=20,
            habitacoes_destruidas=500,
            habitacoes_danificadas=2000,
            coordenador_responsavel='Coordenador Provincial Sofala',
            cenoe_ativado=True,
            fonte_informacao='INAM',
        )

        Alerta.objects.create(
            evento=evento2,
            tipo_risco=tipo_cheia,
            titulo='Alerta Laranja - Cheias na Bacia do Búzi',
            mensagem='Devido às chuvas intensas dos últimos dias, o nível do rio Búzi subiu para níveis críticos. População das zonas baixas deve evacuar imediatamente para zonas altas.',
            nivel='urgente',
            prioridade=5,
            data_emissao=datetime.now() - timedelta(hours=6),
            valido_ate=datetime.now() + timedelta(hours=18),
            acoes_recomendadas=['Evacuar zona ribeirinha', 'Levar documentos', 'Dirigir-se para abrigos'],
            areas_evacuacao='Zona Alta de Búzi',
            canais=['SMS', 'APP', 'RADIO'],
            total_destinatarios=30000,
            total_enviados=28500,
            total_confirmados=15000,
            emitido_por_entidade='INGD',
        )

        Alerta.objects.create(
            evento=evento2,
            tipo_risco=tipo_cheia,
            titulo='Alerta Amarelo - Precipitação em Sofala',
            mensagem='Previsão de chuva intensa nas próximas 24h. População deve manter-se alerta.',
            nivel='atencao',
            prioridade=3,
            data_emissao=datetime.now() - timedelta(hours=2),
            valido_ate=datetime.now() + timedelta(hours=22),
            canais=['SMS', 'APP'],
            total_destinatarios=50000,
            total_enviados=48000,
            emitido_por_entidade='INAM',
        )

        self.stdout.write(self.style.SUCCESS(f'   2 eventos + 2 alertas'))

        # ============================================
        # RESUMO FINAL
        # ============================================
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✅ Base de dados povoada com sucesso!'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'   Infraestruturas:  {Infraestrutura.objects.count()}')
        self.stdout.write(f'   Abrigos:          {Abrigo.objects.count()}')
        self.stdout.write(f'   Áreas de Risco:   {AreaRisco.objects.count()}')
        self.stdout.write(f'   Áreas Seguras:    {AreaSegura.objects.count()}')
        self.stdout.write(f'   Equipas:          {EquipaResposta.objects.count()}')
        self.stdout.write(f'   Recursos:         {Recurso.objects.count()}')
        self.stdout.write(f'   Eventos:          {EventoDesastre.objects.count()}')
        self.stdout.write(f'   Alertas:          {Alerta.objects.count()}')
        self.stdout.write('=' * 60)