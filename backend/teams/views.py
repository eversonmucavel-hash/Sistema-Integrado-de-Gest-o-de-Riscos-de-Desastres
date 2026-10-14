"""
SIGRD - Views da app Teams
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import TipoEquipa, EquipaResposta, Missao, RastreamentoGPS
from .serializers import (
    TipoEquipaSerializer,
    EquipaRespostaSerializer, EquipaRespostaGeoSerializer,
    MissaoSerializer, MissaoGeoSerializer,
    RastreamentoGPSSerializer, RastreamentoGPSGeoSerializer,
)


class TipoEquipaViewSet(viewsets.ModelViewSet):
    """API de Tipos de Equipa"""
    queryset = TipoEquipa.objects.all()
    serializer_class = TipoEquipaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering = ['nome']


class EquipaRespostaViewSet(viewsets.ModelViewSet):
    """
    API de Equipas de Resposta
    - Filtros: ?status=standby&tipo_equipa=1&evento=1
    - Acoes: /disponiveis/, /proximas/?lat=..&lon=.., /geojson/
    """
    queryset = EquipaResposta.objects.select_related('tipo_equipa', 'evento', 'distrito_atuacao').all()
    serializer_class = EquipaRespostaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo_equipa', 'instituicao', 'lider_nome']
    ordering_fields = ['nome', 'codigo_equipa', 'status']
    ordering = ['nome']
    filterset_fields = ['tipo_equipa', 'evento', 'status', 'distrito_atuacao', 'ativo']

    @action(detail=False, methods=['get'])
    def disponiveis(self, request):
        """Equipas em standby prontas a serem ativadas"""
        queryset = self.get_queryset().filter(status='standby', ativo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def em_missao(self, request):
        """Equipas atualmente em missao"""
        queryset = self.get_queryset().filter(status='em_missao', ativo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def proximas(self, request):
        """Equipas proximas de uma coordenada: /proximas/?lat=..&lon=..&raio=50"""
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            raio_km = float(request.query_params.get('raio', 50))
        except (TypeError, ValueError):
            return Response(
                {'erro': 'Parametros obrigatorios: lat, lon'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ponto = Point(lon, lat, srid=4326)
        queryset = self.get_queryset().filter(
            geometria__distance_lte=(ponto, D(km=raio_km)),
            ativo=True,
            status__in=['standby', 'em_missao']
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
        serializer = EquipaRespostaGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class MissaoViewSet(viewsets.ModelViewSet):
    """
    API de Missoes
    - Filtros: ?status=em_andamento&prioridade=alta&equipa=1&evento=1
    - Acoes: /em_andamento/, /pendentes/, /concluir/{id}/
    """
    queryset = Missao.objects.select_related('equipa', 'evento').all()
    serializer_class = MissaoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo_missao', 'titulo', 'descricao']
    ordering_fields = ['data_atribuicao', 'prioridade', 'status']
    ordering = ['-data_atribuicao']
    filterset_fields = ['equipa', 'evento', 'status', 'prioridade', 'tipo']

    @action(detail=False, methods=['get'])
    def em_andamento(self, request):
        queryset = self.get_queryset().filter(status='em_andamento')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pendentes(self, request):
        queryset = self.get_queryset().filter(status='pendente')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        """Iniciar uma missao pendente"""
        missao = self.get_object()
        missao.status = 'em_andamento'
        missao.data_inicio = timezone.now()
        missao.save()
        serializer = self.get_serializer(missao)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        """Concluir uma missao em andamento"""
        missao = self.get_object()
        missao.status = 'concluida'
        missao.data_conclusao = timezone.now()
        if missao.data_inicio:
            delta = missao.data_conclusao - missao.data_inicio
            missao.duracao_minutos = int(delta.total_seconds() / 60)
        missao.save()
        serializer = self.get_serializer(missao)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = MissaoGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class RastreamentoGPSViewSet(viewsets.ModelViewSet):
    """
    API de Rastreamento GPS (log)
    - Filtros: ?equipa=1&missao=1
    """
    queryset = RastreamentoGPS.objects.select_related('equipa', 'missao').all()
    serializer_class = RastreamentoGPSSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering = ['-timestamp']
    filterset_fields = ['equipa', 'missao']

    @action(detail=False, methods=['get'])
    def ultimas_posicoes(self, request):
        """Ultima posicao conhecida de cada equipa ativa"""
        equipas = EquipaResposta.objects.filter(ativo=True).exclude(geometria=None)
        dados = []
        for eq in equipas:
            dados.append({
                'equipa_id': eq.id,
                'codigo_equipa': eq.codigo_equipa,
                'nome': eq.nome,
                'status': eq.status,
                'latitude': eq.latitude,
                'longitude': eq.longitude,
                'ultima_atualizacao': eq.ultima_atualizacao_gps,
            })
        return Response(dados)