"""
SIGRD - Views da app Weather
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    EstacaoMeteorologica, LeituraMeteorologica,
    PontoMedicaoRio, MedicaoNivelRio,
    ImagemSatelite,
)
from .serializers import (
    EstacaoMeteorologicaSerializer, EstacaoMeteorologicaGeoSerializer,
    LeituraMeteorologicaSerializer,
    PontoMedicaoRioSerializer, PontoMedicaoRioGeoSerializer,
    MedicaoNivelRioSerializer,
    ImagemSateliteSerializer, ImagemSateliteGeoSerializer,
)


class EstacaoMeteorologicaViewSet(viewsets.ModelViewSet):
    """API de Estacoes Meteorologicas"""
    queryset = EstacaoMeteorologica.objects.select_related('distrito').all()
    serializer_class = EstacaoMeteorologicaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'nome']
    ordering = ['nome']
    filterset_fields = ['distrito', 'operacional', 'tipo']

    @action(detail=True, methods=['get'])
    def ultima_leitura(self, request, pk=None):
        """Ultima leitura de uma estacao"""
        estacao = self.get_object()
        ultima = estacao.leituras.order_by('-timestamp_leitura').first()
        if not ultima:
            return Response({'erro': 'Sem leituras'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LeituraMeteorologicaSerializer(ultima)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = EstacaoMeteorologicaGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class LeituraMeteorologicaViewSet(viewsets.ModelViewSet):
    """
    API de Leituras Meteorologicas
    - Filtros: ?estacao=1&data_inicio=2026-10-01&data_fim=2026-10-13
    """
    queryset = LeituraMeteorologica.objects.select_related('estacao').all()
    serializer_class = LeituraMeteorologicaSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering = ['-timestamp_leitura']
    filterset_fields = ['estacao']

    def get_queryset(self):
        qs = super().get_queryset()
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        if data_inicio:
            qs = qs.filter(timestamp_leitura__gte=data_inicio)
        if data_fim:
            qs = qs.filter(timestamp_leitura__lte=data_fim)
        return qs

    @action(detail=False, methods=['get'])
    def recentes(self, request):
        """Leituras das ultimas 24h"""
        ha_24h = timezone.now() - timedelta(hours=24)
        queryset = self.get_queryset().filter(timestamp_leitura__gte=ha_24h)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PontoMedicaoRioViewSet(viewsets.ModelViewSet):
    """API de Pontos de Medicao de Rio"""
    queryset = PontoMedicaoRio.objects.select_related('distrito').all()
    serializer_class = PontoMedicaoRioSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'nome', 'rio']
    ordering = ['rio', 'nome']
    filterset_fields = ['distrito', 'operacional']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = PontoMedicaoRioGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class MedicaoNivelRioViewSet(viewsets.ModelViewSet):
    """
    API de Medicoes de Nivel de Rio
    - Filtros: ?ponto=1&status_alerta=perigo
    """
    queryset = MedicaoNivelRio.objects.select_related('ponto').all()
    serializer_class = MedicaoNivelRioSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering = ['-timestamp_medicao']
    filterset_fields = ['ponto', 'status_alerta']

    @action(detail=False, methods=['get'])
    def perigo(self, request):
        """Medicoes em estado de perigo ou critico"""
        queryset = self.get_queryset().filter(status_alerta__in=['perigo', 'critico'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recentes(self, request):
        """Medicoes das ultimas 24h"""
        ha_24h = timezone.now() - timedelta(hours=24)
        queryset = self.get_queryset().filter(timestamp_medicao__gte=ha_24h)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ImagemSateliteViewSet(viewsets.ModelViewSet):
    """API de Imagens de Satelite"""
    queryset = ImagemSatelite.objects.select_related('evento').all()
    serializer_class = ImagemSateliteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['fonte', 'tipo']
    ordering = ['-data_aquisicao']
    filterset_fields = ['fonte', 'tipo', 'evento', 'processada']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ImagemSateliteGeoSerializer(queryset, many=True)
        return Response(serializer.data)