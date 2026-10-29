"""
SIGRD - Script de povoamento da base de dados
Executar: python seed_data.py
"""
import os
import sys
import random
from datetime import datetime, timedelta
from decimal import Decimal

# ============================================
# 1. FORÇAR GDAL PRIMEIRO (Antes de importar o Django)
# ============================================
GDAL_PATH = r'C:\Users\everson\miniconda3\envs\sigrd\Library\bin\gdal.dll'
if os.path.exists(GDAL_PATH):
    os.environ['GDAL_LIBRARY_PATH'] = GDAL_PATH
    GDAL_DIR = os.path.dirname(GDAL_PATH)
    os.environ['PATH'] = GDAL_DIR + os.pathsep + os.environ['PATH']
    if hasattr(os, 'add_dll_directory'):
        try:
            os.add_dll_directory(GDAL_DIR)
        except OSError:
            pass

# ============================================
# 2. CONFIGURAR O DJANGO
# ============================================
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigrd_core.settings')
import django
django.setup()

# ============================================
# 3. IMPORTAR MODELOS (Depois do Django estar pronto)
# ============================================
from django.contrib.gis.geos import Point, Polygon
from geography.models import Distrito
from risks.models import TipoRisco, AreaRisco, AreaSegura, RotaEvacuacao
from shelters.models import CategoriaInfraestrutura, Infraestrutura, Abrigo
from teams.models import TipoEquipa, EquipaResposta
from resources.models import CategoriaRecurso, Recurso
from alerts.models import Alerta

# ============================================
# 0. APAGAR DADOS ANTIGOS
# ============================================
print("=" * 60)
print("SIGRD - A povoar base de dados")
print("=" * 60)

print("\n[0/8] A limpar dados antigos...")
Alerta.objects.all().delete()
Recurso.objects.all().delete()
EquipaResposta.objects.all().delete()
Abrigo.objects.all().delete()
Infraestrutura.objects.all().delete()
RotaEvacuacao.objects.all().delete()
AreaSegura.objects.all().delete()
AreaRisco.objects.all().delete()
TipoRisco.objects.all().delete()
CategoriaInfraestrutura.objects.all().delete()
CategoriaRecurso.objects.all().delete()
TipoEquipa.objects.all().delete()
print("   OK")

# ============================================
# 0.5. CRIAR CATEGORIAS BASE
# ============================================
print("\n[0.5/8] A criar categorias base...")

tipos_risco_data = [
    {"codigo": "CICLONE", "nome": "Ciclone", "descricao": "Tempestade tropical"},
    {"codigo": "CHEIA", "nome": "Cheia", "descricao": "Inundação por subida do nível da água"},
    {"codigo": "SECA", "nome": "Seca", "descricao": "Período prolongado de falta de chuva"},
    {"codigo": "EROSAO", "nome": "Erosão", "descricao": "Desgaste do solo ou costa"},
    {"codigo": "TERRAMOTO", "nome": "Terramoto", "descricao": "Abalo sísmico"},
]
for tr in tipos_risco_data:
    TipoRisco.objects.get_or_create(codigo=tr["codigo"], defaults={"nome": tr["nome"], "descricao": tr["descricao"]})

cat_infra_data = [
    {"codigo": "ESCOLA", "nome": "Escola"},
    {"codigo": "SAUDE", "nome": "Centro de Saúde"},
    {"codigo": "AGUA", "nome": "Ponto de Água"},
    {"codigo": "ENERGIA", "nome": "Energia"},
]
for c in cat_infra_data:
    CategoriaInfraestrutura.objects.get_or_create(codigo=c["codigo"], defaults={"nome": c["nome"]})

cat_recurso_data = [
    {"codigo": "AGUA", "nome": "Água Potável", "unidade_medida": "litros"},
    {"codigo": "COMIDA", "nome": "Alimentos", "unidade_medida": "kg"},
    {"codigo": "KIT_HIGIENE", "nome": "Kit de Higiene", "unidade_medida": "unidades"},
    {"codigo": "COBERTOR", "nome": "Cobertor", "unidade_medida": "unidades"},
]
for cr in cat_recurso_data:
    CategoriaRecurso.objects.get_or_create(codigo=cr["codigo"], defaults={"nome": cr["nome"], "unidade_medida": cr["unidade_medida"]})

tipos_equipa_data = [
    {"codigo": "BUSCA_SALVAMENTO", "nome": "Busca e Salvamento"},
    {"codigo": "SAUDE", "nome": "Saúde"},
    {"codigo": "AVALIACAO", "nome": "Avaliação"},
]
for te in tipos_equipa_data:
    TipoEquipa.objects.get_or_create(codigo=te["codigo"], defaults={"nome": te["nome"]})

print("   Categorias e tipos base criados/verificados")

# ============================================
# 1. INFRAESTRUTURAS
# ============================================
print("\n[1/8] A criar infraestruturas...")

cat_escola = CategoriaInfraestrutura.objects.get(codigo='ESCOLA')
cat_saude = CategoriaInfraestrutura.objects.get(codigo='SAUDE')
cat_agua = CategoriaInfraestrutura.objects.get(codigo='AGUA')

beira = Distrito.objects.filter(nome__icontains='Beira').first()
buzi = Distrito.objects.filter(nome__icontains='Buzi').first() or Distrito.objects.filter(nome__icontains='Búzi').first()
quelimane = Distrito.objects.filter(nome__icontains='Quelimane').first()
chokwe = Distrito.objects.filter(nome__icontains='Chokwe').first() or Distrito.objects.filter(nome__icontains='Chókwè').first()
nhamatanda = Distrito.objects.filter(nome__icontains='Nhamatanda').first()

infraestruturas = [
    {"nome": "Escola Primária da Beira", "categoria": cat_escola, "distrito": beira, "lat": -19.8300, "lng": 34.8400, "cap": 500},
    {"nome": "Hospital Central da Beira", "categoria": cat_saude, "distrito": beira, "lat": -19.8250, "lng": 34.8450, "cap": 300},
    {"nome": "Escola Secundária de Búzi", "categoria": cat_escola, "distrito": buzi, "lat": -19.8500, "lng": 34.4000, "cap": 400},
    {"nome": "Centro de Saúde de Búzi", "categoria": cat_saude, "distrito": buzi, "lat": -19.8550, "lng": 34.4050, "cap": 100},
    {"nome": "Escola de Quelimane", "categoria": cat_escola, "distrito": quelimane, "lat": -17.8800, "lng": 36.8900, "cap": 600},
    {"nome": "Hospital Provincial de Quelimane", "categoria": cat_saude, "distrito": quelimane, "lat": -17.8750, "lng": 36.8850, "cap": 250},
    {"nome": "Escola de Chókwè", "categoria": cat_escola, "distrito": chokwe, "lat": -24.5300, "lng": 33.0100, "cap": 350},
    {"nome": "Centro de Saúde de Chókwè", "categoria": cat_saude, "distrito": chokwe, "lat": -24.5350, "lng": 33.0150, "cap": 120},
    {"nome": "Furo de Água Comunitário - Búzi", "categoria": cat_agua, "distrito": buzi, "lat": -19.8600, "lng": 34.4100, "cap": 1000},
    {"nome": "Furo de Água - Nhamatanda", "categoria": cat_agua, "distrito": nhamatanda, "lat": -19.4500, "lng": 34.3500, "cap": 800},
]

for i in infraestruturas:
    if i["distrito"]:
        Infraestrutura.objects.create(
            categoria=i["categoria"],
            distrito=i["distrito"],
            nome=i["nome"],
            geometria=Point(i["lng"], i["lat"], srid=4326),
            capacidade_pessoas=i["cap"],
            operacional=True,
            condicao='boa',
            validado=True,
        )
print(f"   {len(infraestruturas)} infraestruturas criadas")

# ============================================
# 2. ABRIGOS
# ============================================
print("\n[2/8] A criar abrigos...")

abrigos_data = [
    {"nome": "Abrigo Municipal da Beira", "distrito": beira, "lat": -19.8350, "lng": 34.8500, "cap": 500, "tipo": "permanente"},
    {"nome": "Abrigo Escola Búzi", "distrito": buzi, "lat": -19.8600, "lng": 34.4200, "cap": 300, "tipo": "temporario"},
    {"nome": "Abrigo Comunitário de Chókwè", "distrito": chokwe, "lat": -24.5400, "lng": 33.0200, "cap": 400, "tipo": "permanente"},
    {"nome": "Abrigo Quelimane Centro", "distrito": quelimane, "lat": -17.8900, "lng": 36.9000, "cap": 600, "tipo": "permanente"},
    {"nome": "Abrigo Nhamatanda 1", "distrito": nhamatanda, "lat": -19.4600, "lng": 34.3600, "cap": 250, "tipo": "temporario"},
]

for a in abrigos_data:
    if a["distrito"]:
        Abrigo.objects.create(
            distrito=a["distrito"],
            nome=a["nome"],
            tipo=a["tipo"],
            geometria=Point(a["lng"], a["lat"], srid=4326),
            capacidade_maxima=a["cap"],
            ocupacao_atual=random.randint(0, int(a["cap"] * 0.6)),
            status='aberto',
            condicao='boa',
            tem_agua=True,
            tem_energia=True,
            tem_saneamento=True,
            responsavel='Coordenador INGD',
            telefone_contacto='+258840000000',
            ativo=True,
        )
print(f"   {len(abrigos_data)} abrigos criados")

# ============================================
# 3. ÁREAS DE RISCO
# ============================================
print("\n[3/8] A criar áreas de risco...")

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
    {"nome": "Zona Costeira da Beira", "tipo": tipo_ciclone, "distrito": beira, "lat": -19.8400, "lng": 34.8500, "nivel": "critico", "pop": 50000},
    {"nome": "Bacia do Búzi - Zona Baixa", "tipo": tipo_cheia, "distrito": buzi, "lat": -19.8600, "lng": 34.4000, "nivel": "critico", "pop": 30000},
    {"nome": "Zona Ribeirinha de Chókwè", "tipo": tipo_cheia, "distrito": chokwe, "lat": -24.5400, "lng": 33.0100, "nivel": "alto", "pop": 25000},
    {"nome": "Zona Baixa de Quelimane", "tipo": tipo_cheia, "distrito": quelimane, "lat": -17.8900, "lng": 36.8900, "nivel": "alto", "pop": 20000},
    {"nome": "Zona de Seca - Interior de Gaza", "tipo": tipo_seca, "distrito": chokwe, "lat": -24.5000, "lng": 33.0500, "nivel": "medio", "pop": 15000},
    {"nome": "Erosão Costeira - Beira Norte", "tipo": tipo_erosao, "distrito": beira, "lat": -19.8100, "lng": 34.8600, "nivel": "alto", "pop": 10000},
]

for ar in areas_risco_data:
    if ar["distrito"]:
        AreaRisco.objects.create(
            distrito=ar["distrito"],
            tipo_risco=ar["tipo"],
            nome_area=ar["nome"],
            geometria=criar_poligono(ar["lat"], ar["lng"]),
            nivel_risco=ar["nivel"],
            probabilidade='provavel',
            impacto='grave',
            populacao_exposta=ar["pop"],
            familias_expostas=ar["pop"] // 5,
            escolas_em_risco=random.randint(1, 5),
            centros_saude_em_risco=random.randint(0, 2),
            habitacoes_em_risco=random.randint(50, 500),
            validado=True,
            fonte_dados='Satélite',
            ativo=True,
        )
print(f"   {len(areas_risco_data)} áreas de risco criadas")

# ============================================
# 4. ÁREAS SEGURAS
# ============================================
print("\n[4/8] A criar áreas seguras...")

areas_seguras_data = [
    {"nome": "Zona Alta da Beira", "distrito": beira, "lat": -19.8200, "lng": 34.8300, "cap": 5000},
    {"nome": "Zona Alta de Búzi", "distrito": buzi, "lat": -19.8400, "lng": 34.3800, "cap": 3000},
    {"nome": "Zona Alta de Chókwè", "distrito": chokwe, "lat": -24.5100, "lng": 33.0000, "cap": 4000},
]

for asg in areas_seguras_data:
    if asg["distrito"]:
        AreaSegura.objects.create(
            distrito=asg["distrito"],
            nome=asg["nome"],
            tipo='zona_alta',
            geometria=criar_poligono(asg["lat"], asg["lng"], tamanho=0.03),
            capacidade_pessoas=asg["cap"],
            tem_agua_potavel=True,
            tem_energia=True,
            tem_comunicacao=True,
            tem_saneamento=True,
            validado=True,
            ativo=True,
        )
print(f"   {len(areas_seguras_data)} áreas seguras criadas")

# ============================================
# 5. EQUIPAS DE RESPOSTA
# ============================================
print("\n[5/8] A criar equipas de resposta...")

tipo_busca = TipoEquipa.objects.filter(codigo='BUSCA_SALVAMENTO').first()
tipo_saude = TipoEquipa.objects.filter(codigo='SAUDE').first()
tipo_aval = TipoEquipa.objects.filter(codigo='AVALIACAO').first()

equipas_data = [
    {"nome": "Equipa INGD - Beira", "tipo": tipo_busca, "inst": "INGD", "distrito": beira, "lat": -19.8300, "lng": 34.8400, "membros": 8},
    {"nome": "Equipa INGD - Búzi", "tipo": tipo_busca, "inst": "INGD", "distrito": buzi, "lat": -19.8600, "lng": 34.4000, "membros": 6},
    {"nome": "Equipa Cruz Vermelha - Beira", "tipo": tipo_saude, "inst": "Cruz Vermelha", "distrito": beira, "lat": -19.8350, "lng": 34.8500, "membros": 10},
    {"nome": "Equipa Bombeiros - Quelimane", "tipo": tipo_busca, "inst": "Bombeiros", "distrito": quelimane, "lat": -17.8800, "lng": 36.8900, "membros": 12},
    {"nome": "Equipa Avaliação - Chókwè", "tipo": tipo_aval, "inst": "INGD", "distrito": chokwe, "lat": -24.5300, "lng": 33.0100, "membros": 5},
]

for idx, eq in enumerate(equipas_data, start=1):
    if eq["distrito"] and eq["tipo"]:
        EquipaResposta.objects.create(
            tipo_equipa=eq["tipo"],
            codigo_equipa=f"EQ-2026-{idx:03d}",
            nome=eq["nome"],
            instituicao=eq["inst"],
            lider_nome=f"Líder {idx}",
            lider_telefone='+258840000000',
            numero_membros=eq["membros"],
            geometria=Point(eq["lng"], eq["lat"], srid=4326),
          #  id_distrito_atuacao=eq["distrito"],
            status='standby',
            ativo=True,
        )
print(f"   {len(equipas_data)} equipas criadas")

# ============================================
# 6. RECURSOS
# ============================================
print("\n[6/8] A criar recursos...")

cat_agua = CategoriaRecurso.objects.get(codigo='AGUA')
cat_comida = CategoriaRecurso.objects.get(codigo='COMIDA')
cat_kit = CategoriaRecurso.objects.get(codigo='KIT_HIGIENE')
cat_cobertor = CategoriaRecurso.objects.get(codigo='COBERTOR')

recursos_data = [
    {"nome": "Água Potável - Armazém Beira", "cat": cat_agua, "qtd": 50000, "distrito": beira, "unidade": "litros", "doador": "UNICEF"},
    {"nome": "Arroz - Armazém Beira", "cat": cat_comida, "qtd": 10000, "distrito": beira, "unidade": "kg", "doador": "WFP"},
    {"nome": "Kits Higiene - Beira", "cat": cat_kit, "qtd": 2000, "distrito": beira, "unidade": "unidades", "doador": "UNICEF"},
    {"nome": "Cobertores - Beira", "cat": cat_cobertor, "qtd": 3000, "distrito": beira, "unidade": "unidades", "doador": "Cruz Vermelha"},
    {"nome": "Água - Búzi", "cat": cat_agua, "qtd": 20000, "distrito": buzi, "unidade": "litros", "doador": "Governo"},
    {"nome": "Alimentos - Búzi", "cat": cat_comida, "qtd": 5000, "distrito": buzi, "unidade": "kg", "doador": "WFP"},
    {"nome": "Kits Higiene - Quelimane", "cat": cat_kit, "qtd": 1500, "distrito": quelimane, "unidade": "unidades", "doador": "ONG Local"},
    {"nome": "Água - Chókwè", "cat": cat_agua, "qtd": 15000, "distrito": chokwe, "unidade": "litros", "doador": "Governo"},
]

for r in recursos_data:
    if r["distrito"]:
        Recurso.objects.create(
            categoria=r["cat"],
            nome=r["nome"],
            quantidade_disponivel=Decimal(r["qtd"]),
            unidade_medida=r["unidade"],
            #id_distrito=r["distrito"],
            local_armazenamento='Armazém Central',
            doador=r["doador"],
            tipo_doador='Internacional',
            status='disponivel',
        )
print(f"   {len(recursos_data)} recursos criados")

# ============================================
# 7. ALERTAS
# ============================================
print("\n[7/8] A criar alertas...")

alerta1 = Alerta.objects.create(
    tipo_risco=tipo_cheia,   # <--- ADICIONE ESTA LINHA
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

alerta2 = Alerta.objects.create(
    tipo_risco=tipo_cheia,   # <--- ADICIONE ESTA LINHA
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

print("   2 alertas criados")
# ============================================
# 8. RESUMO
# ============================================
print("\n[8/8] Resumo final:")
print(f"   Infraestruturas:  {Infraestrutura.objects.count()}")
print(f"   Abrigos:          {Abrigo.objects.count()}")
print(f"   Áreas de Risco:   {AreaRisco.objects.count()}")
print(f"   Áreas Seguras:    {AreaSegura.objects.count()}")
print(f"   Equipas:          {EquipaResposta.objects.count()}")
print(f"   Recursos:         {Recurso.objects.count()}")
print(f"   Alertas:          {Alerta.objects.count()}")

print("\n" + "=" * 60)
print("✅ Base de dados povoada com sucesso!")
print("=" * 60)