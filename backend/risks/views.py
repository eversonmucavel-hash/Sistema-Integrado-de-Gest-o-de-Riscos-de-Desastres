"""
SIGRD - Views da app Risks
"""
from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TipoRisco, AreaRisco, AreaSegura, RotaEvacuacao
from .serializers import (
    TipoRiscoSerializer,
    AreaRiscoSerializer, AreaRiscoGeoSerializer,
    AreaSeguraSerializer, AreaSeguraGeoSerializer,
    RotaEvacuacaoSerializer, RotaEvacuacaoGeoSerializer,
)


class TipoRiscoViewSet(viewsets.ModelViewSet):
    """API de Tipos de Risco"""
    queryset = TipoRisco.objects.all()
    serializer_class = TipoRiscoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering = ['nome']


class AreaRiscoViewSet(viewsets.ModelViewSet):
    """
    API de Areas de Risco
    - Filtros: ?nivel_risco=critico&tipo_risco=1&distrito=5
    - GeoJSON: /api/risks/areas-risco/geojson/
    """
    queryset = AreaRisco.objects.select_related('distrito', 'tipo_risco').all()
    serializer_class = AreaRiscoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome_area', 'descricao']
    ordering_fields = ['nivel_risco', 'populacao_exposta', 'created_at']
    ordering = ['-nivel_risco']
    filterset_fields = ['nivel_risco', 'tipo_risco', 'distrito', 'probabilidade', 'impacto', 'ativo']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = AreaRiscoGeoSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def criticas(self, request):
        """Areas criticas e de alto risco"""
        queryset = self.get_queryset().filter(nivel_risco__in=['critico', 'alto'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AreaSeguraViewSet(viewsets.ModelViewSet):
    """API de Areas Seguras"""
    queryset = AreaSegura.objects.select_related('distrito').all()
    serializer_class = AreaSeguraSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering = ['nome']
    filterset_fields = ['tipo', 'distrito', 'ativo', 'tem_agua_potavel', 'tem_energia']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = AreaSeguraGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class RotaEvacuacaoViewSet(viewsets.ModelViewSet):
    """API de Rotas de Evacuacao"""
    queryset = RotaEvacuacao.objects.select_related('distrito', 'area_origem', 'area_destino').all()
    serializer_class = RotaEvacuacaoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering = ['nome']
    filterset_fields = ['distrito', 'condicao', 'acessivel_veiculos', 'ativo']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = RotaEvacuacaoGeoSerializer(queryset, many=True)
        return Response(serializer.data)