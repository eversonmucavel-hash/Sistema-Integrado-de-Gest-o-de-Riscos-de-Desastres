"""
SIGRD - Views da app Displaced
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django_filters.rest_framework import DjangoFilterBackend
from .models import Deslocado
from .serializers import DeslocadoSerializer, DeslocadoListaSerializer


class DeslocadoViewSet(viewsets.ModelViewSet):
    """
    API de Deslocados
    - Filtros: ?abrigo=1&status=ativo&vulneravel=true&evento=1
    - Acoes: /vulneraveis/, /por_abrigo/, /estatisticas/
    """
    queryset = Deslocado.objects.select_related('abrigo', 'evento').all()
    serializer_class = DeslocadoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome_completo', 'documento_identificacao', 'telefone']
    ordering_fields = ['data_entrada', 'nome_completo']
    ordering = ['-data_entrada']
    filterset_fields = [
        'abrigo', 'evento', 'status', 'vulneravel',
        'sexo', 'distrito_origem',
    ]

    def get_serializer_class(self):
        if self.action == 'list':
            return DeslocadoListaSerializer
        return DeslocadoSerializer

    @action(detail=False, methods=['get'])
    def vulneraveis(self, request):
        """Deslocados vulneraveis ativos"""
        queryset = self.get_queryset().filter(vulneravel=True, status='ativo')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_abrigo(self, request):
        """Agregado por abrigo: quantos deslocados cada abrigo tem"""
        dados = self.get_queryset().filter(status='ativo').values(
            'abrigo__id', 'abrigo__nome', 'abrigo__capacidade_maxima', 'abrigo__ocupacao_atual'
        ).annotate(
            total_deslocados=Count('id'),
            total_pessoas=Sum('numero_acompanhantes'),
        ).order_by('-total_deslocados')

        return Response(dados)

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Estatisticas gerais dos deslocados"""
        qs = self.get_queryset().filter(status='ativo')
        total = qs.count()
        vulneraveis = qs.filter(vulneravel=True).count()
        acompanhantes = qs.aggregate(total=Sum('numero_acompanhantes'))['total'] or 0

        por_sexo = list(qs.values('sexo').annotate(total=Count('id')))
        por_distrito_origem = list(
            qs.values('distrito_origem')
            .annotate(total=Count('id'))
            .order_by('-total')[:10]
        )

        return Response({
            'total_deslocados': total,
            'total_pessoas': total + acompanhantes,
            'vulneraveis': vulneraveis,
            'acompanhantes': acompanhantes,
            'por_sexo': por_sexo,
            'por_distrito_origem': por_distrito_origem,
        })