"""
SIGRD - Views da app Resources
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Count, F
from django_filters.rest_framework import DjangoFilterBackend
from .models import CategoriaRecurso, Recurso, Distribuicao
from .serializers import (
    CategoriaRecursoSerializer,
    RecursoSerializer, RecursoGeoSerializer,
    DistribuicaoSerializer,
)


class CategoriaRecursoViewSet(viewsets.ModelViewSet):
    """API de Categorias de Recurso"""
    queryset = CategoriaRecurso.objects.all()
    serializer_class = CategoriaRecursoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering = ['nome']


class RecursoViewSet(viewsets.ModelViewSet):
    """
    API de Recursos
    - Filtros: ?categoria=1&status=disponivel&distrito=5&evento=1
    - Acoes: /disponiveis/, /por_categoria/, /por_evento/, /geojson/
    """
    queryset = Recurso.objects.select_related('categoria', 'distrito', 'evento').all()
    serializer_class = RecursoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao', 'doador']
    ordering_fields = ['nome', 'data_recepcao', 'quantidade_disponivel']
    ordering = ['-data_recepcao']
    filterset_fields = ['categoria', 'distrito', 'evento', 'status', 'tipo_doador']

    @action(detail=False, methods=['get'])
    def disponiveis(self, request):
        """Recursos com quantidade disponivel > 0"""
        queryset = self.get_queryset().filter(
            status='disponivel',
            quantidade_disponivel__gt=0
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        """Agregado por categoria"""
        dados = self.get_queryset().values(
            'categoria__id', 'categoria__nome', 'categoria__unidade_medida'
        ).annotate(
            total_itens=Count('id'),
            total_disponivel=Sum('quantidade_disponivel'),
            total_distribuido=Sum('quantidade_distribuida'),
        ).order_by('-total_disponivel')

        return Response(list(dados))

    @action(detail=False, methods=['get'])
    def por_evento(self, request):
        """Agregado por evento"""
        dados = self.get_queryset().exclude(evento=None).values(
            'evento__id', 'evento__nome', 'evento__codigo_evento'
        ).annotate(
            total_recursos=Count('id'),
            total_distribuido=Sum('quantidade_distribuida'),
        ).order_by('-total_distribuido')

        return Response(list(dados))

    @action(detail=False, methods=['get'])
    def geojson(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = RecursoGeoSerializer(queryset, many=True)
        return Response(serializer.data)


class DistribuicaoViewSet(viewsets.ModelViewSet):
    """
    API de Distribuicoes
    - Filtros: ?recurso=1&abrigo=2&equipa=3&missao=4
    - Acoes: /por_abrigo/, /por_recurso/, /estatisticas/
    """
    queryset = Distribuicao.objects.select_related(
        'recurso', 'abrigo', 'equipa', 'missao'
    ).all()
    serializer_class = DistribuicaoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['responsavel_nome', 'observacoes']
    ordering_fields = ['data_distribuicao', 'quantidade']
    ordering = ['-data_distribuicao']
    filterset_fields = ['recurso', 'abrigo', 'equipa', 'missao']

    @transaction.atomic
    def perform_create(self, serializer):
        """Ao criar uma distribuicao, atualiza o stock do recurso"""
        distribuicao = serializer.save()

        recurso = distribuicao.recurso
        # Reduzir disponivel, aumentar distribuido
        recurso.quantidade_disponivel = F('quantidade_disponivel') - distribuicao.quantidade
        recurso.quantidade_distribuida = F('quantidade_distribuida') + distribuicao.quantidade
        recurso.save(update_fields=['quantidade_disponivel', 'quantidade_distribuida'])

    @action(detail=False, methods=['get'])
    def por_abrigo(self, request):
        """Total distribuido por abrigo"""
        dados = self.get_queryset().exclude(abrigo=None).values(
            'abrigo__id', 'abrigo__nome'
        ).annotate(
            total_distribuicoes=Count('id'),
            total_beneficiarios=Sum('numero_beneficiarios'),
        ).order_by('-total_distribuicoes')

        return Response(list(dados))

    @action(detail=False, methods=['get'])
    def por_recurso(self, request):
        """Total distribuido por recurso"""
        dados = self.get_queryset().values(
            'recurso__id', 'recurso__nome', 'recurso__unidade_medida'
        ).annotate(
            total_quantidade=Sum('quantidade'),
            total_distribuicoes=Count('id'),
        ).order_by('-total_quantidade')

        return Response(list(dados))

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Estatisticas gerais de distribuicao"""
        qs = self.get_queryset()

        total = qs.count()
        total_beneficiarios = qs.aggregate(t=Sum('numero_beneficiarios'))['t'] or 0
        total_quantidade = qs.aggregate(t=Sum('quantidade'))['t'] or 0

        return Response({
            'total_distribuicoes': total,
            'total_beneficiarios': total_beneficiarios,
            'total_quantidade_distribuida': float(total_quantidade),
            'total_recursos_distintos': qs.values('recurso').distinct().count(),
            'total_abrigos_beneficiados': qs.exclude(abrigo=None).values('abrigo').distinct().count(),
        })