"""
SIGRD - Serializers da app Resources
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import CategoriaRecurso, Recurso, Distribuicao


class CategoriaRecursoSerializer(serializers.ModelSerializer):
    total_recursos = serializers.SerializerMethodField()

    class Meta:
        model = CategoriaRecurso
        fields = ['id', 'codigo', 'nome', 'unidade_medida', 'total_recursos']

    def get_total_recursos(self, obj):
        return obj.recursos.count()


class RecursoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    categoria_codigo = serializers.CharField(source='categoria.codigo', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    quantidade_total = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = [
            'id', 'nome', 'descricao',
            'categoria', 'categoria_nome', 'categoria_codigo',
            'evento', 'evento_nome',
            'quantidade_disponivel', 'quantidade_alocada', 'quantidade_distribuida',
            'quantidade_total', 'unidade_medida',
            'distrito', 'distrito_nome', 'local_armazenamento',
            'data_validade',
            'doador', 'tipo_doador', 'valor_estimado_mt',
            'data_recepcao', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['data_recepcao', 'created_at', 'updated_at']

    def get_quantidade_total(self, obj):
        return float(obj.quantidade_total)


class RecursoGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Recurso
        geo_field = 'geometria'
        fields = ['id', 'nome', 'quantidade_disponivel', 'unidade_medida', 'status']


class DistribuicaoSerializer(serializers.ModelSerializer):
    recurso_nome = serializers.CharField(source='recurso.nome', read_only=True)
    abrigo_nome = serializers.CharField(source='abrigo.nome', read_only=True)
    equipa_nome = serializers.CharField(source='equipa.nome', read_only=True)
    missao_titulo = serializers.CharField(source='missao.titulo', read_only=True)

    class Meta:
        model = Distribuicao
        fields = [
            'id',
            'recurso', 'recurso_nome',
            'abrigo', 'abrigo_nome',
            'equipa', 'equipa_nome',
            'missao', 'missao_titulo',
            'quantidade', 'unidade_medida', 'numero_beneficiarios',
            'data_distribuicao',
            'responsavel_nome', 'responsavel_telefone',
            'comprovante_foto', 'assinatura_digital',
            'observacoes', 'created_at',
        ]
        read_only_fields = ['data_distribuicao', 'created_at']