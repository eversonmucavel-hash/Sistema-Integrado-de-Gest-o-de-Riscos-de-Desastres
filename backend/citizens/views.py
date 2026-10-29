"""
SIGRD - Views da app Citizens
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.gis.geos import Point
from django.db.models import Count
from .models import PessoaRegistada
from .serializers import (
    PessoaRegistadaSerializer,
    PessoaRegistadaPublicSerializer,
    PessoaRegistadaGeoSerializer,
)


class RegistoPublicoView(APIView):
    """
    Endpoint público para cidadãos se registarem.
    Não requer autenticação.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PessoaRegistadaPublicSerializer(data=request.data)
        if serializer.is_valid():
            # Se tem lat/lng, cria a geometria
            lat = serializer.validated_data.get('latitude')
            lng = serializer.validated_data.get('longitude')

            pessoa = serializer.save(origem_registo='website')

            if lat and lng:
                pessoa.geometria = Point(float(lng), float(lat), srid=4326)
                pessoa.save()

            return Response({
                'mensagem': 'Registo efetuado com sucesso. Vai receber alertas por SMS.',
                'id': pessoa.id,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PessoaRegistadaViewSet(viewsets.ModelViewSet):
    """
    API de Cidadãos Registados.
    Filtros: ?distrito=1&vulneravel=true&ativo=true&receber_alertas=true
    Ações: /estatisticas/, /por_distrito/, /geojson/, /importar/
    """
    queryset = PessoaRegistada.objects.select_related(
        'distrito', 'distrito__provincia'
    ).all()
    serializer_class = PessoaRegistadaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome_completo', 'telefone_principal', 'endereco']
    ordering_fields = ['nome_completo', 'created_at', 'distrito']
    ordering = ['nome_completo']
    filterset_fields = ['distrito', 'ativo', 'validado', 'pessoa_vulneravel', 'receber_alertas', 'sexo']

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Estatísticas gerais de cidadãos"""
        qs = self.get_queryset()
        total = qs.count()
        ativos = qs.filter(ativo=True).count()
        com_alertas = qs.filter(ativo=True, receber_alertas=True).count()
        vulneraveis = qs.filter(pessoa_vulneravel=True, ativo=True).count()

        return Response({
            'total': total,
            'ativos': ativos,
            'recebem_alertas': com_alertas,
            'vulneraveis': vulneraveis,
        })

    @action(detail=False, methods=['get'])
    def por_distrito(self, request):
        """Contagem de cidadãos por distrito"""
        dados = self.get_queryset().filter(ativo=True).values(
            'distrito__id', 'distrito__nome', 'distrito__provincia__nome'
        ).annotate(total=Count('id')).order_by('-total')

        return Response(list(dados))

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        """Cidadãos em formato GeoJSON (para o mapa)"""
        queryset = self.filter_queryset(
            self.get_queryset().filter(geometria__isnull=False)
        )
        serializer = PessoaRegistadaGeoSerializer(queryset, many=True)
        return Response(serializer.data)