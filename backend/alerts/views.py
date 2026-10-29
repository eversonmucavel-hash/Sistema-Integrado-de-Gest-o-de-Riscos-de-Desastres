"""
SIGRD - Views da app Alerts
"""
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Alerta, AlertaEnviado
from .serializers import AlertaSerializer, AlertaGeoSerializer, AlertaEnviadoSerializer


class AlertaViewSet(viewsets.ModelViewSet):
    """
    API de Alertas
    - Filtros: ?nivel=critico&cancelado=false&tipo_risco=1
    - Acoes: /ativos/, /criticos/, /por-evento/{id}/
    """
    queryset = Alerta.objects.select_related('tipo_risco', 'evento', 'emitido_por').all()
    serializer_class = AlertaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'mensagem']
    ordering_fields = ['data_emissao', 'nivel', 'prioridade']
    ordering = ['-data_emissao']
    filterset_fields = ['nivel', 'tipo_risco', 'evento', 'cancelado', 'emitido_por_entidade']

    def perform_create(self, serializer):
        """Ao criar um alerta, associa o utilizador autenticado"""
        serializer.save(emitido_por=self.request.user)

    @action(detail=False, methods=['get'])
    def ativos(self, request):
        """Alertas nao cancelados e ainda dentro da validade"""
        agora = timezone.now()
        queryset = self.get_queryset().filter(
            cancelado=False
        ).exclude(
            valido_ate__lt=agora
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def criticos(self, request):
        """Alertas de nivel critico e urgente"""
        queryset = self.get_queryset().filter(nivel__in=['critico', 'urgente'], cancelado=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancelar um alerta"""
        alerta = self.get_object()
        alerta.cancelado = True
        alerta.data_cancelamento = timezone.now()
        alerta.save()
        serializer = self.get_serializer(alerta)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """Alertas em formato GeoJSON"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = AlertaGeoSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enviar_sms(self, request, pk=None):
        """
        Dispara o envio de SMS para os destinatários do alerta.
        Body:
            {
                "destinatarios": [
                    {"numero": "+258840000000", "nome": "João Silva"},
                    ...
                ]
            }
        """
        alerta = self.get_object()
        destinatarios = request.data.get('destinatarios', [])

        if not destinatarios:
            return Response(
                {'erro': 'Lista de destinatarios vazia'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Disparar tarefa Celery (assíncrona)
        from notifications.tasks import enviar_alerta_sms
        task = enviar_alerta_sms.delay(alerta.id, destinatarios)

        return Response({
            'mensagem': 'Envio de SMS iniciado em background',
            'task_id': task.id,
            'total_destinatarios': len(destinatarios),
            'alerta_id': alerta.id,
        }, status=status.HTTP_202_ACCEPTED)
    @action(detail=True, methods=['post'], url_path='disparar')
    def disparar(self, request, pk=None):
        """
        Dispara o alerta para todos os cidadãos registados na zona.
        O sistema descobre automaticamente quem avisar com base na
        geometria do alerta ou nos distritos_alvo.

        Não requer payload.
        """
        alerta = self.get_object()

        if alerta.cancelado:
            return Response(
                {'erro': 'Nao e possivel disparar um alerta cancelado'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar se tem dados para identificar alvos
        if not alerta.geometria and not alerta.distritos_alvo:
            return Response(
                {
                    'erro': (
                        'O alerta nao tem geometria nem distritos_alvo definidos. '
                        'Defina pelo menos um destes campos.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Disparar tarefa Celery
        from alerts.tasks import disparar_alerta_zona
        task = disparar_alerta_zona.delay(alerta.id)

        return Response({
            'mensagem': 'Envio de alerta iniciado em background',
            'task_id': task.id,
            'alerta_id': alerta.id,
            'tem_geometria': bool(alerta.geometria),
            'distritos_alvo': alerta.distritos_alvo,
        }, status=status.HTTP_202_ACCEPTED)

class AlertaEnviadoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API de Alertas Enviados (read-only - log)
    Filtros: ?alerta=1&canal=SMS&status=entregue
    """
    queryset = AlertaEnviado.objects.select_related('alerta').all()
    serializer_class = AlertaEnviadoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['destinatario']
    ordering = ['-created_at']
    filterset_fields = ['alerta', 'canal', 'status']