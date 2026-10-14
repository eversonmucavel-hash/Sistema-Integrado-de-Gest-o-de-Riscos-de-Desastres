"""
SIGRD - Serializers da app Geography
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Provincia, Distrito


class ProvinciaSerializer(serializers.ModelSerializer):
    """Serializer simples para Provincia (sem geometria)"""
    total_distritos = serializers.SerializerMethodField()

    class Meta:
        model = Provincia
        fields = [
            'id', 'codigo', 'nome', 'capital', 'area_km2',
            'populacao_estimada', 'total_distritos',
            'created_at', 'updated_at',
        ]

    def get_total_distritos(self, obj):
        return obj.distritos.count()


class ProvinciaGeoSerializer(GeoFeatureModelSerializer):
    """Serializer com geometria (GeoJSON)"""
    class Meta:
        model = Provincia
        geo_field = 'geometria'
        fields = ['id', 'codigo', 'nome', 'capital', 'area_km2', 'populacao_estimada']


class DistritoSerializer(serializers.ModelSerializer):
    """Serializer para Distrito"""
    provincia_nome = serializers.CharField(source='provincia.nome', read_only=True)

    class Meta:
        model = Distrito
        fields = [
            'id', 'codigo', 'nome', 'provincia', 'provincia_nome',
            'area_km2', 'populacao_estimada', 'nivel_risco',
            'ultima_avaliacao_risco', 'created_at', 'updated_at',
        ]


class DistritoGeoSerializer(GeoFeatureModelSerializer):
    """Serializer com geometria (GeoJSON)"""
    class Meta:
        model = Distrito
        geo_field = 'geometria'
        fields = [
            'id', 'codigo', 'nome', 'nivel_risco',
            'area_km2', 'populacao_estimada',
        ]