"""
SIGRD - Serializers da app Shelters
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import CategoriaInfraestrutura, Infraestrutura, Abrigo


class CategoriaInfraestruturaSerializer(serializers.ModelSerializer):
    total_infraestruturas = serializers.SerializerMethodField()

    class Meta:
        model = CategoriaInfraestrutura
        fields = ['id', 'codigo', 'nome', 'icone', 'cor', 'total_infraestruturas']

    def get_total_infraestruturas(self, obj):
        return obj.infraestruturas.filter(ativo=True).count()


class InfraestruturaSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    categoria_icone = serializers.CharField(source='categoria.icone', read_only=True)
    categoria_cor = serializers.CharField(source='categoria.cor', read_only=True)
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = Infraestrutura
        fields = [
            'id', 'nome', 'descricao', 'endereco',
            'categoria', 'categoria_nome', 'categoria_icone', 'categoria_cor',
            'distrito', 'distrito_nome',
            'latitude', 'longitude', 'altitude_m',
            'telefone', 'email', 'responsavel',
            'capacidade_pessoas', 'capacidade_atual',
            'operacional', 'condicao',
            'recursos',
            'em_area_risco', 'area_risco', 'nivel_vulnerabilidade',
            'fonte_dados', 'validado', 'ultima_inspecao', 'ativo',
            'created_at', 'updated_at',
        ]


class InfraestruturaGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Infraestrutura
        geo_field = 'geometria'
        fields = ['id', 'nome', 'operacional', 'condicao', 'categoria']


class AbrigoSerializer(serializers.ModelSerializer):
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    vagas_disponiveis = serializers.SerializerMethodField()

    class Meta:
        model = Abrigo
        fields = [
            'id', 'nome', 'tipo',
            'infraestrutura', 'distrito', 'distrito_nome',
            'evento', 'evento_nome',
            'latitude', 'longitude', 'endereco',
            'capacidade_maxima', 'ocupacao_atual',
            'disponibilidade_percentual', 'vagas_disponiveis',
            'status', 'condicao',
            'tem_agua', 'tem_energia', 'tem_saneamento', 'tem_cozinha', 'tem_area_saude',
            'recursos',
            'responsavel', 'telefone_contacto',
            'data_abertura', 'data_encerramento', 'ativo',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['disponibilidade_percentual']

    def get_vagas_disponiveis(self, obj):
        return max(0, obj.capacidade_maxima - obj.ocupacao_atual)


class AbrigoGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Abrigo
        geo_field = 'geometria'
        fields = ['id', 'nome', 'status', 'ocupacao_atual', 'capacidade_maxima']