"""
SIGRD - Sistema Integrado de Gestão de Riscos de Desastres
Configurações Django
"""
import os
import sys
import glob

# Forçar UTF-8 no Windows
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PGCLIENTENCODING'] = 'UTF8'

# Fix para Windows
if sys.platform == 'win32':
    import locale
    try:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    except locale.Error:
        pass # Ignora se o locale não existir no sistema

from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# GEODJANGO - Configuração para Conda (Windows)
# ============================================
import os

CONDA_LIB_BIN = r'C:\Users\everson\miniconda3\envs\sigrd\Library\bin'

# Adicionar ao PATH para que o Python encontre as dependências da DLL
if CONDA_LIB_BIN not in os.environ['PATH']:
    os.environ['PATH'] = CONDA_LIB_BIN + os.pathsep + os.environ['PATH']
if hasattr(os, 'add_dll_directory'):
    try:
        os.add_dll_directory(CONDA_LIB_BIN)
    except OSError:
        pass

# O NOME EXATO É 'gdal.dll'
GDAL_LIBRARY_PATH = os.path.join(CONDA_LIB_BIN, 'gdal.dll')

# GEOS (normalmente tem este nome no Conda)
GEOS_LIBRARY_PATH = os.path.join(CONDA_LIB_BIN, 'geos_c.dll')

# PROJ
PROJ_LIB = os.path.join(CONDA_LIB_BIN, '..', 'share', 'proj')
if os.path.exists(PROJ_LIB):
    os.environ['PROJ_LIB'] = PROJ_LIB

# ============================================
# SEGURANÇA
# ============================================
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-insecure-change-me')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

# ============================================
# APLICAÇÕES INSTALADAS
# ============================================
INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',

    # Terceiros
    'rest_framework',
    'rest_framework_gis',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_celery_beat',
    'django_celery_results',

    # Apps SIGRD
    'accounts',
    'citizens', 
    'geography',
    'risks',
    'alerts',
    'shelters',
    'displaced',
    'teams',
    'resources',
    'weather',
    'incidents',
    'reports',
    'notifications',
    'audit',
]

# ============================================
# MIDDLEWARE
# ============================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sigrd_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sigrd_core.wsgi.application'

# ============================================
# BASE DE DADOS (PostgreSQL + PostGIS)
# ============================================
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('DB_NAME', 'sigrd_db'),
        'USER': os.getenv('DB_USER', 'sigrd_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'sigrd_password_2024'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
    }
}

# ============================================
# AUTENTICAÇÃO
# ============================================
AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ============================================
# INTERNACIONALIZAÇÃO
# ============================================
LANGUAGE_CODE = 'pt-mz'
TIME_ZONE = 'Africa/Maputo'
USE_I18N = True
USE_TZ = True

# ============================================
# FICHEIROS ESTÁTICOS E MEDIA
# ============================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================
# DJANGO REST FRAMEWORK
# ============================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'SIGRD API',
    'DESCRIPTION': 'Sistema Integrado de Gestão de Riscos de Desastres - Moçambique',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ============================================
# CORS
# ============================================
CORS_ALLOWED_ORIGINS = [
    "http://192.168.201.198:9000",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost",
    "capacitor://localhost",
]
CORS_ALLOW_ALL_ORIGINS = True

# ============================================
# CELERY
# ============================================
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Maputo'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_TASK_ALWAYS_EAGER = False

# ============================================
# CACHE (Redis)
# ============================================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    }
}

# ============================================
# SMS BACKEND
# ============================================
SMS_BACKEND = os.getenv('SMS_BACKEND', 'console')
TEXTBEE_API_KEY = os.getenv('TEXTBEE_API_KEY', '')
TEXTBEE_DEVICE_ID = os.getenv('TEXTBEE_DEVICE_ID', '')
TEXTBELT_API_KEY = os.getenv('TEXTBELT_API_KEY', 'textbelt')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')

CSRF_TRUSTED_ORIGINS = [
    "http://192.168.189.198:9000",
    "http://localhost",
    "capacitor://localhost",
]