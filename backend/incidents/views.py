"""
SIGRD - Views da app Incidents
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import EventoDesastre
from .serializers import EventoDesastreSerializer, EventoDesastreGeoSerializer


class EventoDesastreViewSet(viewsets.ModelViewSet):
    """
    API de Eventos de Desastre
    - Filtros: ?nivel_alerta=vermelho&estado_resposta=emergencia&ativo=true
    - GeoJSON: /api/incidents/eventos/geojson/
    - Ativos: /api/incidents/eventos/ativos/
    """
    queryset = EventoDesastre.objects.select_related('tipo_risco').all()
    serializer_class = EventoDesastreSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo_evento', 'nome', 'descricao']
    ordering_fields = ['data_inicio', 'nivel_alerta', 'pessoas_afetadas']
    ordering = ['-data_inicio']
    filterset_fields = ['nivel_alerta', 'estado_resposta', 'tipo_risco', 'ativo', 'intensidade']

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """Retorna os eventos em formato GeoJSON"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = EventoDesastreGeoSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ativos(self, request):
        """Retorna apenas eventos ativos"""
        queryset = self.get_queryset().filter(ativo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def emergencia(self, request):
        """Retorna eventos em estado de emergencia"""
        queryset = self.get_queryset().filter(estado_resposta='emergencia', ativo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)