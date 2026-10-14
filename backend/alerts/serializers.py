"""
SIGRD - Serializers da app Alerts
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Alerta, AlertaEnviado


class AlertaEnviadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaEnviado
        fields = [
            'id', 'alerta', 'destinatario', 'canal', 'mensagem_enviada',
            'status', 'data_envio', 'data_entrega', 'data_leitura',
            'erro', 'tentativas', 'created_at',
        ]


class AlertaSerializer(serializers.ModelSerializer):
    tipo_risco_nome = serializers.CharField(source='tipo_risco.nome', read_only=True)
    tipo_risco_cor = serializers.CharField(source='tipo_risco.cor_mapa', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    emitido_por_nome = serializers.CharField(source='emitido_por.nome_completo', read_only=True)
    total_envios = serializers.SerializerMethodField()

    class Meta:
        model = Alerta
        fields = [
            'id', 'titulo', 'mensagem',
            'evento', 'evento_nome',
            'tipo_risco', 'tipo_risco_nome', 'tipo_risco_cor',
            'nivel', 'prioridade',
            'distritos_alvo', 'raio_km',
            'data_emissao', 'valido_ate',
            'acoes_recomendadas', 'areas_evacuacao',
            'canais', 'total_destinatarios', 'total_enviados', 'total_confirmados',
            'emitido_por', 'emitido_por_nome', 'emitido_por_entidade',
            'cancelado', 'data_cancelamento',
            'total_envios', 'created_at',
        ]
        read_only_fields = [
            'data_emissao', 'total_enviados', 'total_confirmados',
            'data_cancelamento', 'created_at',
        ]

    def get_total_envios(self, obj):
        return obj.envios.count()


class AlertaGeoSerializer(GeoFeatureModelSerializer):
    """GeoJSON do alerta"""
    class Meta:
        model = Alerta
        geo_field = 'geometria'
        fields = ['id', 'titulo', 'nivel', 'data_emissao', 'cancelado']