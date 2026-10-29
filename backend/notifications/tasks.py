"""
SIGRD - Tarefas assíncronas de notificações
"""
from celery import shared_task
from django.utils import timezone


@shared_task
def tarefa_teste(mensagem='Olá SIGRD'):
    """
    Tarefa de teste para validar o pipeline Celery
    """
    timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    resultado = f'[{timestamp}] {mensagem}'
    print(resultado)
    return resultado


@shared_task
def contagem_geral():
    """
    Conta registos em várias tabelas e devolve um resumo
    """
    from geography.models import Provincia, Distrito
    from risks.models import AreaRisco
    from shelters.models import Abrigo
    from alerts.models import Alerta
    from resources.models import Recurso

    resumo = {
        'provincias': Provincia.objects.count(),
        'distritos': Distrito.objects.count(),
        'areas_risco': AreaRisco.objects.count(),
        'abrigos': Abrigo.objects.count(),
        'alertas': Alerta.objects.count(),
        'recursos': Recurso.objects.count(),
        'timestamp': timezone.now().isoformat(),
    }

    print(f'[CELERY] Contagem geral: {resumo}')
    return resumo

from celery import shared_task
from django.utils import timezone
from django.db import transaction


@shared_task(bind=True, max_retries=3)
def enviar_alerta_sms(self, alerta_id, destinatarios):
    """
    Envia SMS para uma lista de destinatários.

    Argumentos:
        alerta_id (int): ID do alerta
        destinatarios (list): Lista de dicts com 'numero' e 'nome'

    Devolve:
        dict: Resumo do envio
    """
    from alerts.models import Alerta
    from notifications.models import NotificacaoSMS
    from notifications.sms import get_backend

    try:
        alerta = Alerta.objects.get(id=alerta_id)
    except Alerta.DoesNotExist:
        return {'erro': f'Alerta {alerta_id} nao encontrado'}

    backend = get_backend()
    mensagem_completa = f'{alerta.titulo}\n\n{alerta.mensagem}'

    sucessos = 0
    falhas = 0
    resultados = []

    for destinatario in destinatarios:
        numero = destinatario.get('numero')
        nome = destinatario.get('nome', 'Desconhecido')

        if not numero:
            continue

        # Registar na base de dados
        notificacao = NotificacaoSMS.objects.create(
            numero=numero,
            mensagem=mensagem_completa,
            backend=backend.nome,
            status='pendente',
            alerta=alerta,
        )

        # Enviar
        resultado = backend.enviar(numero, mensagem_completa)

        if resultado['sucesso']:
            notificacao.status = 'enviado'
            notificacao.sid_externo = resultado.get('sid')
            notificacao.enviado_em = timezone.now()
            sucessos += 1
        else:
            notificacao.status = 'falhou'
            notificacao.erro = resultado.get('erro', 'Erro desconhecido')
            falhas += 1

        notificacao.tentativas += 1
        notificacao.save()

        resultados.append({
            'numero': numero,
            'nome': nome,
            'sucesso': resultado['sucesso'],
        })

    # Atualizar contadores do alerta
    alerta.total_enviados = sucessos
    alerta.save(update_fields=['total_enviados'])

    return {
        'alerta_id': alerta_id,
        'total': len(destinatarios),
        'sucessos': sucessos,
        'falhas': falhas,
        'backend': backend.nome,
        'detalhes': resultados[:5],  # primeiros 5 para log
        'timestamp': timezone.now().isoformat(),
    }