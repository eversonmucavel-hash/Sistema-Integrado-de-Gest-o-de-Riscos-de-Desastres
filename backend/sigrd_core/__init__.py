"""
SIGRD - Pacote principal
Importa a app Celery para garantir que arranca com o Django
"""
from .celery import app as celery_app

__all__ = ('celery_app',)