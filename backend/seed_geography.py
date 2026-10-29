import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigrd_core.settings')
django.setup()

from geography.models import Provincia, Distrito

print("A criar Províncias e Distritos...")

# 1. Criar Províncias (com codigo obrigatório)
provincias_data = [
    {"codigo": "MPT", "nome": "Maputo"},
    {"codigo": "GZA", "nome": "Gaza"},
    {"codigo": "INH", "nome": "Inhambane"},
    {"codigo": "SFL", "nome": "Sofala"},
    {"codigo": "MNC", "nome": "Manica"},
    {"codigo": "TET", "nome": "Tete"},
    {"codigo": "ZMB", "nome": "Zambézia"},
    {"codigo": "NMP", "nome": "Nampula"},
    {"codigo": "CDL", "nome": "Cabo Delgado"},
    {"codigo": "NSA", "nome": "Niassa"},
    {"codigo": "MPC", "nome": "Maputo Cidade"},
]

provincias_objs = {}
for p in provincias_data:
    prov, created = Provincia.objects.get_or_create(
        codigo=p["codigo"], 
        defaults={"nome": p["nome"]}
    )
    provincias_objs[p["nome"]] = prov
    if created:
        print(f"   + Província: {p['nome']} ({p['codigo']})")

# 2. Criar Distritos (com codigo obrigatório)
distritos_data = [
    {"codigo": "BEA", "nome": "Beira", "provincia": "Sofala"},
    {"codigo": "BUZ", "nome": "Búzi", "provincia": "Sofala"},
    {"codigo": "NHA", "nome": "Nhamatanda", "provincia": "Sofala"},
    {"codigo": "QUE", "nome": "Quelimane", "provincia": "Zambézia"},
    {"codigo": "CHO", "nome": "Chókwè", "provincia": "Gaza"},
    {"codigo": "MAT", "nome": "Matola", "provincia": "Maputo"},
    {"codigo": "XAI", "nome": "Xai-Xai", "provincia": "Gaza"},
]

for d in distritos_data:
    prov = provincias_objs.get(d["provincia"])
    if prov:
        dist, created = Distrito.objects.get_or_create(
            codigo=d["codigo"], 
            defaults={"nome": d["nome"], "provincia": prov}
        )
        if created:
            print(f"   + Distrito: {d['nome']} ({d['provincia']})")

print("\n✅ Geografia criada com sucesso!")