"""
SIGRD - Configuração do Celery
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigrd_core.settings')

app = Celery('sigrd_core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


# ============================================
# AGENDAMENTO DE TAREFAS (Celery Beat)
# ============================================
app.conf.beat_schedule = {
    'verificar-alertas-expirados': {
        'task': 'alerts.tasks.verificar_alertas_expirados',
        'schedule': crontab(minute=0),  # A cada hora (minuto 0)
    },
    'verificar-abrigos-lotados': {
        'task': 'alerts.tasks.verificar_abrigos_lotados',
        'schedule': crontab(minute='*/30'),  # A cada 30 minutos
    },
    'gerar-relatorio-diario': {
        'task': 'alerts.tasks.gerar_relatorio_diario',
        'schedule': crontab(hour=8, minute=0),  # Todos os dias às 8h
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')