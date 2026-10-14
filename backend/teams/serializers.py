"""
SIGRD - Serializers da app Teams
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import TipoEquipa, EquipaResposta, Missao, RastreamentoGPS


class TipoEquipaSerializer(serializers.ModelSerializer):
    total_equipas = serializers.SerializerMethodField()

    class Meta:
        model = TipoEquipa
        fields = ['id', 'codigo', 'nome', 'descricao', 'total_equipas']

    def get_total_equipas(self, obj):
        return obj.equipas.filter(ativo=True).count()


class EquipaRespostaSerializer(serializers.ModelSerializer):
    tipo_equipa_nome = serializers.CharField(source='tipo_equipa.nome', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    distrito_atuacao_nome = serializers.CharField(source='distrito_atuacao.nome', read_only=True)
    total_missoes = serializers.SerializerMethodField()

    class Meta:
        model = EquipaResposta
        fields = [
            'id', 'codigo_equipa', 'nome', 'instituicao',
            'tipo_equipa', 'tipo_equipa_nome',
            'evento', 'evento_nome',
            'lider_nome', 'lider_telefone', 'numero_membros',
            'latitude', 'longitude', 'ultima_atualizacao_gps',
            'distrito_atuacao', 'distrito_atuacao_nome',
            'veiculo', 'equipamentos', 'capacidade_atendimento',
            'status', 'missao_atual',
            'data_ativacao', 'data_desativacao', 'ativo',
            'total_missoes',
            'created_at', 'updated_at',
        ]

    def get_total_missoes(self, obj):
        return obj.missoes.count()


class EquipaRespostaGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = EquipaResposta
        geo_field = 'geometria'
        fields = ['id', 'codigo_equipa', 'nome', 'status']


class MissaoSerializer(serializers.ModelSerializer):
    equipa_nome = serializers.CharField(source='equipa.nome', read_only=True)
    equipa_codigo = serializers.CharField(source='equipa.codigo_equipa', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)

    class Meta:
        model = Missao
        fields = [
            'id', 'codigo_missao', 'titulo', 'descricao', 'tipo',
            'equipa', 'equipa_nome', 'equipa_codigo',
            'evento', 'evento_nome',
            'latitude', 'longitude', 'endereco',
            'data_atribuicao', 'data_inicio', 'data_conclusao', 'duracao_minutos',
            'prioridade', 'status',
            'pessoas_atendidas', 'pessoas_resgatadas', 'recursos_distribuidos',
            'relatorio', 'fotos',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['data_atribuicao', 'created_at', 'updated_at']


class MissaoGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Missao
        geo_field = 'geometria'
        fields = ['id', 'codigo_missao', 'titulo', 'status', 'prioridade']


class RastreamentoGPSSerializer(serializers.ModelSerializer):
    equipa_codigo = serializers.CharField(source='equipa.codigo_equipa', read_only=True)

    class Meta:
        model = RastreamentoGPS
        fields = [
            'id', 'equipa', 'equipa_codigo', 'missao',
            'latitude', 'longitude', 'altitude_m',
            'precisao_m', 'velocidade_kmh', 'direcao_graus',
            'timestamp', 'dispositivo', 'app_version',
        ]


class RastreamentoGPSGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RastreamentoGPS
        geo_field = 'geometria'
        fields = ['id', 'equipa', 'missao', 'timestamp', 'velocidade_kmh']