from django.shortcuts import render

# Create your views here.
"""
SIGRD - Views da app Shelters
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django_filters.rest_framework import DjangoFilterBackend
from .models import CategoriaInfraestrutura, Infraestrutura, Abrigo
from .serializers import (
    CategoriaInfraestruturaSerializer,
    InfraestruturaSerializer, InfraestruturaGeoSerializer,
    AbrigoSerializer, AbrigoGeoSerializer,
)


class CategoriaInfraestruturaViewSet(viewsets.ModelViewSet):
    """API de Categorias de Infraestrutura"""
    queryset = CategoriaInfraestrutura.objects.all()
    serializer_class = CategoriaInfraestruturaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering = ['nome']


class InfraestruturaViewSet(viewsets.ModelViewSet):
    """
    API de Infraestruturas
    - Filtros: ?categoria=1&distrito=5&operacional=true&em_area_risco=true
    """
    queryset = Infraestrutura.objects.select_related('categoria', 'distrito').all()
    serializer_class = InfraestruturaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao', 'responsavel']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']
    filterset_fields = ['categoria', 'distrito', 'operacional', 'condicao', 'em_area_risco', 'ativo']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = InfraestruturaGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class AbrigoViewSet(viewsets.ModelViewSet):
    """
    API de Abrigos
    - Filtros: ?status=aberto&distrito=5&evento=1
    - Acoes: /disponiveis/, /proximos/?lat=..&lon=.., /geojson/
    """
    queryset = Abrigo.objects.select_related('distrito', 'evento', 'infraestrutura').all()
    serializer_class = AbrigoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'responsavel']
    ordering_fields = ['nome', 'ocupacao_atual', 'capacidade_maxima']
    ordering = ['nome']
    filterset_fields = ['status', 'distrito', 'evento', 'tipo', 'condicao', 'ativo']

    @action(detail=False, methods=['get'])
    def disponiveis(self, request):
        """Abrigos com vagas disponiveis"""
        queryset = self.get_queryset().filter(
            status__in=['aberto', 'em_preparacao'],
            ativo=True
        ).exclude(
            ocupacao_atual__gte=models.F('capacidade_maxima')
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def proximos(self, request):
        """Abrigos proximos de uma coordenada: /proximos/?lat=..&lon=..&raio=50"""
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            raio_km = float(request.query_params.get('raio', 50))
        except (TypeError, ValueError):
            return Response(
                {'erro': 'Parametros obrigatorios: lat, lon (raio opcional, default 50km)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ponto = Point(lon, lat, srid=4326)
        queryset = self.get_queryset().filter(
            geometria__distance_lte=(ponto, D(km=raio_km)),
            ativo=True,
            status__in=['aberto', 'em_preparacao']
        ).order_by('geometria')

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'ponto_origem': {'lat': lat, 'lon': lon, 'raio_km': raio_km},
            'total': queryset.count(),
            'resultados': serializer.data,
        })

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = AbrigoGeoSerializer(queryset, many=True)
        return Response(serializer.data)