"""
SIGRD - Serializers da app Weather
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    EstacaoMeteorologica, LeituraMeteorologica,
    PontoMedicaoRio, MedicaoNivelRio,
    ImagemSatelite,
)


class EstacaoMeteorologicaSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    total_leituras = serializers.SerializerMethodField()

    class Meta:
        model = EstacaoMeteorologica
        fields = [
            'id', 'codigo', 'nome', 'tipo',
            'latitude', 'longitude', 'altitude_m',
            'distrito', 'distrito_nome',
            'operacional', 'ultima_leitura',
            'total_leituras', 'created_at',
        ]

    def get_total_leituras(self, obj):
        return obj.leituras.count()


class EstacaoMeteorologicaGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = EstacaoMeteorologica
        geo_field = 'geometria'
        fields = ['id', 'codigo', 'nome', 'operacional']


class LeituraMeteorologicaSerializer(serializers.ModelSerializer):
    estacao_codigo = serializers.CharField(source='estacao.codigo', read_only=True)
    estacao_nome = serializers.CharField(source='estacao.nome', read_only=True)

    class Meta:
        model = LeituraMeteorologica
        fields = [
            'id',
            'estacao', 'estacao_codigo', 'estacao_nome',
            'timestamp_leitura',
            'temperatura_c', 'umidade_percentual',
            'precipitacao_mm', 'velocidade_vento_kmh', 'direcao_vento_graus',
            'pressao_atmosferica_hpa',
            'precipitacao_24h_mm', 'precipitacao_7dias_mm',
            'created_at',
        ]


class PontoMedicaoRioSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    ultima_medicao = serializers.SerializerMethodField()

    class Meta:
        model = PontoMedicaoRio
        fields = [
            'id', 'codigo', 'nome', 'rio',
            'latitude', 'longitude', 'altitude_m',
            'distrito', 'distrito_nome',
            'nivel_alerta_m', 'nivel_perigo_m',
            'operacional', 'ultima_medicao', 'created_at',
        ]

    def get_ultima_medicao(self, obj):
        ultima = obj.medicoes.order_by('-timestamp_medicao').first()
        if ultima:
            return {
                'nivel_agua_m': float(ultima.nivel_agua_m),
                'status_alerta': ultima.status_alerta,
                'timestamp': ultima.timestamp_medicao,
            }
        return None


class PontoMedicaoRioGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = PontoMedicaoRio
        geo_field = 'geometria'
        fields = ['id', 'codigo', 'nome', 'rio', 'nivel_alerta_m', 'nivel_perigo_m']


class MedicaoNivelRioSerializer(serializers.ModelSerializer):
    ponto_nome = serializers.CharField(source='ponto.nome', read_only=True)
    rio_nome = serializers.CharField(source='ponto.rio', read_only=True)

    class Meta:
        model = MedicaoNivelRio
        fields = [
            'id',
            'ponto', 'ponto_nome', 'rio_nome',
            'timestamp_medicao',
            'nivel_agua_m', 'vazao_m3_s', 'status_alerta',
            'created_at',
        ]


class ImagemSateliteSerializer(serializers.ModelSerializer):
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)

    class Meta:
        model = ImagemSatelite
        fields = [
            'id', 'fonte', 'tipo',
            'area_km2', 'data_aquisicao',
            'resolucao_metros', 'cobertura_nuvens_percentual',
            'url_preview', 'url_download', 'url_wms',
            'evento', 'evento_nome',
            'processada', 'analise', 'created_at',
        ]


class ImagemSateliteGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = ImagemSatelite
        geo_field = 'geometria'
        fields = ['id', 'fonte', 'data_aquisicao', 'resolucao_metros', 'processada']