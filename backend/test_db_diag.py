import os
import sys
from pathlib import Path

# 1. Carregar .env
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
print(f"A carregar .env de: {env_path}")
print(f"Existe? {env_path.exists()}")
load_dotenv(env_path)

# 2. Mostrar variáveis
print("\n=== Variáveis de ambiente ===")
for var in ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']:
    value = os.getenv(var)
    print(f"{var} = {value!r}")

# 3. Testar ligação psycopg diretamente
print("\n=== Teste psycopg3 ===")
import psycopg
try:
    conn = psycopg.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
    )
    print("✅ Ligacao psycopg OK!")
    with conn.cursor() as cur:
        cur.execute("SELECT current_user, current_database()")
        print("   User:", cur.fetchone())
    conn.close()
except Exception as e:
    print(f"❌ Erro psycopg: {e}")
    sys.exit(1)

# 4. Testar Django
print("\n=== Teste Django ===")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigrd_core.settings')
import django
django.setup()

from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print("✅ Ligacao Django OK!")
except Exception as e:
    print(f"❌ Erro Django: {e}")