"""
SIGRD - Views da app Geography
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Provincia, Distrito
from .serializers import (
    ProvinciaSerializer, ProvinciaGeoSerializer,
    DistritoSerializer, DistritoGeoSerializer,
)


class ProvinciaViewSet(viewsets.ModelViewSet):
    """
    API de Províncias
    - Listar: GET /api/geography/provincias/
    - Criar: POST /api/geography/provincias/
    - Detalhe: GET /api/geography/provincias/{id}/
    - Atualizar: PUT /api/geography/provincias/{id}/
    - Apagar: DELETE /api/geography/provincias/{id}/
    - GeoJSON: GET /api/geography/provincias/geojson/
    """
    queryset = Provincia.objects.all()
    serializer_class = ProvinciaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo', 'capital']
    ordering_fields = ['nome', 'codigo', 'populacao_estimada']
    ordering = ['nome']
    filterset_fields = ['codigo']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """Retorna as provincias em formato GeoJSON"""
        queryset = self.get_queryset()
        serializer = ProvinciaGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class DistritoViewSet(viewsets.ModelViewSet):
    """
    API de Distritos
    - Listar: GET /api/geography/distritos/
    - Filtrar por nível de risco: ?nivel_risco=alto
    - Filtrar por província: ?provincia=1
    - GeoJSON: GET /api/geography/distritos/geojson/
    """
    queryset = Distrito.objects.select_related('provincia').all()
    serializer_class = DistritoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering_fields = ['nome', 'codigo', 'nivel_risco', 'populacao_estimada']
    ordering = ['provincia__nome', 'nome']
    filterset_fields = ['nivel_risco', 'provincia']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """Retorna os distritos em formato GeoJSON"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = DistritoGeoSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def alto_risco(self, request):
        """Retorna distritos de alto risco e crítico"""
        queryset = self.get_queryset().filter(nivel_risco__in=['alto', 'critico'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)