"""
SIGRD - Tarefas agendadas do Celery Beat
"""
from django.db import models
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def verificar_alertas_expirados():
    """
    Marca como cancelados todos os alertas cujo 'valido_ate' já passou.
    Corre a cada hora.
    """
    from alerts.models import Alerta

    agora = timezone.now()
    alertas_expirados = Alerta.objects.filter(
        valido_ate__lt=agora,
        cancelado=False,
    )

    total = alertas_expirados.count()

    if total == 0:
        return {'total': 0, 'mensagem': 'Nenhum alerta expirado'}

    alertas_expirados.update(
        cancelado=True,
        data_cancelamento=agora,
    )

    print(f'[CELERY BEAT] {total} alertas expirados cancelados')

    return {
        'total': total,
        'timestamp': agora.isoformat(),
    }


@shared_task
def verificar_abrigos_lotados():
    """
    Marca abrigos como 'lotado' quando ocupação ≥ capacidade.
    Corre a cada 30 minutos.
    """
    from shelters.models import Abrigo

    abrigos_lotados = Abrigo.objects.filter(
        ocupacao_atual__gte=models.F('capacidade_maxima'),
    ).exclude(status='lotado')

    total = abrigos_lotados.count()

    if total == 0:
        return {'total': 0, 'mensagem': 'Nenhum abrigo lotado'}

    abrigos_lotados.update(status='lotado')

    print(f'[CELERY BEAT] {total} abrigos marcados como lotados')

    return {
        'total': total,
        'timestamp': timezone.now().isoformat(),
    }


@shared_task
def gerar_relatorio_diario():
    """
    Gera um relatório diário com estatísticas gerais.
    Envia por email aos gestores (se configurado).
    Corre todos os dias às 8h.
    """
    from geography.models import Provincia, Distrito
    from risks.models import AreaRisco
    from shelters.models import Abrigo
    from alerts.models import Alerta
    from resources.models import Recurso
    from citizens.models import PessoaRegistada

    # Estatísticas
    stats = {
        'provincias': Provincia.objects.count(),
        'distritos': Distrito.objects.count(),
        'areas_risco': AreaRisco.objects.count(),
        'abrigos': Abrigo.objects.count(),
        'alertas_ativos': Alerta.objects.filter(cancelado=False).count(),
        'recursos': Recurso.objects.count(),
        'cidadaos': PessoaRegistada.objects.filter(ativo=True).count(),
        'timestamp': timezone.now().isoformat(),
    }

    # Alertas por nível
    from django.db.models import Count
    alertas_por_nivel = list(
        Alerta.objects.filter(cancelado=False)
        .values('nivel')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    # Áreas de risco por nível
    areas_por_nivel = list(
        AreaRisco.objects.filter(ativo=True)
        .values('nivel_risco')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    relatorio = {
        **stats,
        'alertas_por_nivel': alertas_por_nivel,
        'areas_por_nivel': areas_por_nivel,
    }

    # Log no terminal
    print('=' * 60)
    print('[CELERY BEAT] RELATÓRIO DIÁRIO - SIGRD')
    print('=' * 60)
    print(f'Data: {timezone.now().strftime("%d/%m/%Y %H:%M")}')
    print(f'Províncias: {stats["provincias"]}')
    print(f'Distritos: {stats["distritos"]}')
    print(f'Áreas de Risco: {stats["areas_risco"]}')
    print(f'Abrigos: {stats["abrigos"]}')
    print(f'Alertas Ativos: {stats["alertas_ativos"]}')
    print(f'Recursos: {stats["recursos"]}')
    print(f'Cidadãos Registados: {stats["cidadaos"]}')
    print('=' * 60)

    # Enviar email (se configurado)
    try:
        emails = list(
            __import__('accounts.models', fromlist=['User'])
            .User.objects.filter(is_staff=True, email__isnull=False)
            .exclude(email='')
            .values_list('email', flat=True)
        )

        if emails and hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
            mensagem = f"""
RELATÓRIO DIÁRIO SIGRD
======================

Data: {timezone.now().strftime("%d/%m/%Y %H:%M")}

ESTATÍSTICAS:
- Províncias: {stats['provincias']}
- Distritos: {stats['distritos']}
- Áreas de Risco: {stats['areas_risco']}
- Abrigos: {stats['abrigos']}
- Alertas Ativos: {stats['alertas_ativos']}
- Recursos: {stats['recursos']}
- Cidadãos Registados: {stats['cidadaos']}

ALERTAS POR NÍVEL:
{chr(10).join([f"- {a['nivel']}: {a['total']}" for a in alertas_por_nivel])}

ÁREAS DE RISCO POR NÍVEL:
{chr(10).join([f"- {a['nivel_risco']}: {a['total']}" for a in areas_por_nivel])}

---
SIGRD - Sistema Integrado de Gestão de Riscos de Desastres
Moçambique
"""
            send_mail(
                subject=f'[SIGRD] Relatório Diário - {timezone.now().strftime("%d/%m/%Y")}',
                message=mensagem,
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@sigrd.mz',
                recipient_list=emails,
                fail_silently=True,
            )
            print(f'[CELERY BEAT] Email enviado para {len(emails)} gestores')
    except Exception as e:
        print(f'[CELERY BEAT] Erro ao enviar email: {e}')

    return relatorio