"""
SIGRD - Serializers da app Displaced
"""
from rest_framework import serializers
from .models import Deslocado


class DeslocadoSerializer(serializers.ModelSerializer):
    abrigo_nome = serializers.CharField(source='abrigo.nome', read_only=True)
    distrito_abrigo = serializers.CharField(source='abrigo.distrito.nome', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    total_pessoas = serializers.SerializerMethodField()

    class Meta:
        model = Deslocado
        fields = [
            'id', 'nome_completo', 'data_nascimento', 'sexo',
            'documento_identificacao', 'telefone',
            'distrito_origem', 'localidade_origem', 'endereco_origem',
            'vulneravel', 'tipo_vulnerabilidade', 'necessidades_especiais',
            'numero_acompanhantes', 'nomes_acompanhantes', 'total_pessoas',
            'abrigo', 'abrigo_nome', 'distrito_abrigo',
            'evento', 'evento_nome',
            'data_entrada', 'data_saida',
            'distrito_destino', 'endereco_destino',
            'status', 'observacoes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['data_entrada', 'created_at', 'updated_at']

    def get_total_pessoas(self, obj):
        """Total de pessoas = deslocado + acompanhantes"""
        return 1 + (obj.numero_acompanhantes or 0)


class DeslocadoListaSerializer(serializers.ModelSerializer):
    """Serializer resumido para listas"""
    abrigo_nome = serializers.CharField(source='abrigo.nome', read_only=True)

    class Meta:
        model = Deslocado
        fields = [
            'id', 'nome_completo', 'sexo', 'vulneravel',
            'numero_acompanhantes', 'abrigo', 'abrigo_nome',
            'status', 'data_entrada',
        ]