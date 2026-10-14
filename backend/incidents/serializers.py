"""
SIGRD - Serializers da app Incidents
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import EventoDesastre


class EventoDesastreSerializer(serializers.ModelSerializer):
    tipo_risco_nome = serializers.CharField(source='tipo_risco.nome', read_only=True)
    tipo_risco_cor = serializers.CharField(source='tipo_risco.cor_mapa', read_only=True)
    duracao_dias = serializers.SerializerMethodField()

    class Meta:
        model = EventoDesastre
        fields = [
            'id', 'codigo_evento', 'nome', 'descricao',
            'tipo_risco', 'tipo_risco_nome', 'tipo_risco_cor',
            'categoria', 'intensidade',
            'data_inicio', 'data_fim', 'duracao_horas', 'duracao_dias', 'ativo',
            'area_afetada_km2', 'distritos_afetados',
            'pessoas_afetadas', 'pessoas_deslocadas',
            'mortes', 'feridos',
            'habitacoes_destruidas', 'habitacoes_danificadas',
            'velocidade_vento_kmh', 'precipitacao_mm', 'nivel_agua_m',
            'nivel_alerta', 'estado_resposta',
            'coordenador_responsavel', 'cenoe_ativado', 'fonte_informacao',
            'created_at', 'updated_at',
        ]

    def get_duracao_dias(self, obj):
        if obj.data_fim:
            delta = obj.data_fim - obj.data_inicio
            return delta.days
        return None


class EventoDesastreGeoSerializer(GeoFeatureModelSerializer):
    """GeoJSON com a geometria da area afetada"""
    class Meta:
        model = EventoDesastre
        geo_field = 'geometria'
        fields = [
            'id', 'codigo_evento', 'nome',
            'nivel_alerta', 'estado_resposta',
            'pessoas_afetadas', 'tipo_risco',
        ]