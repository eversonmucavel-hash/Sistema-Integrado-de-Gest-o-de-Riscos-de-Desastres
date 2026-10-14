"""
SIGRD - Views da app Alerts
"""
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