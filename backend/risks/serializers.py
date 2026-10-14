"""
SIGRD - Serializers da app Risks
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import TipoRisco, AreaRisco, AreaSegura, RotaEvacuacao


class TipoRiscoSerializer(serializers.ModelSerializer):
    total_areas = serializers.SerializerMethodField()

    class Meta:
        model = TipoRisco
        fields = ['id', 'codigo', 'nome', 'descricao', 'cor_mapa', 'icone', 'ativo', 'total_areas']

    def get_total_areas(self, obj):
        return obj.areas.filter(ativo=True).count()


class AreaRiscoSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    provincia_nome = serializers.CharField(source='distrito.provincia.nome', read_only=True)
    tipo_risco_nome = serializers.CharField(source='tipo_risco.nome', read_only=True)

    class Meta:
        model = AreaRisco
        fields = [
            'id', 'nome_area', 'descricao',
            'distrito', 'distrito_nome', 'provincia_nome',
            'tipo_risco', 'tipo_risco_nome',
            'nivel_risco', 'probabilidade', 'impacto',
            'area_m2', 'perimetro_m',
            'populacao_exposta', 'familias_expostas',
            'escolas_em_risco', 'centros_saude_em_risco', 'habitacoes_em_risco',
            'validado', 'fonte_dados',
            'ativo', 'created_at', 'updated_at',
        ]


class AreaRiscoGeoSerializer(GeoFeatureModelSerializer):
    """Serializer com geometria (GeoJSON)"""
    class Meta:
        model = AreaRisco
        geo_field = 'geometria'
        fields = ['id', 'nome_area', 'nivel_risco', 'populacao_exposta', 'tipo_risco']


class AreaSeguraSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = AreaSegura
        fields = [
            'id', 'nome', 'descricao', 'tipo',
            'distrito', 'distrito_nome',
            'capacidade_pessoas', 'acessibilidade',
            'tem_agua_potavel', 'tem_energia', 'tem_comunicacao', 'tem_saneamento',
            'latitude', 'longitude',
            'validado', 'ultima_inspecao', 'ativo',
            'created_at', 'updated_at',
        ]


class AreaSeguraGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = AreaSegura
        geo_field = 'geometria'
        fields = ['id', 'nome', 'tipo', 'capacidade_pessoas']


class RotaEvacuacaoSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = RotaEvacuacao
        fields = [
            'id', 'nome', 'descricao',
            'distrito', 'distrito_nome',
            'area_origem', 'area_destino',
            'distancia_m', 'tempo_estimado_minutos',
            'largura_media_m', 'tipo_superficie', 'condicao',
            'acessivel_veiculos', 'iluminacao',
            'pontos_referencia',
            'ultima_verificacao', 'ativo', 'created_at',
        ]


class RotaEvacuacaoGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RotaEvacuacao
        geo_field = 'geometria'
        fields = ['id', 'nome', 'condicao', 'distancia_m', 'tempo_estimado_minutos']
        