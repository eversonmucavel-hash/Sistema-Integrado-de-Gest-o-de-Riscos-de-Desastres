"""
SIGRD - Serializers da app Citizens
"""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import PessoaRegistada


class PessoaRegistadaSerializer(serializers.ModelSerializer):
    """Serializer completo para gestão interna"""
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)
    provincia_nome = serializers.CharField(
        source='distrito.provincia.nome', read_only=True
    )
    idade = serializers.IntegerField(read_only=True)

    class Meta:
        model = PessoaRegistada
        fields = [
            'id', 'nome_completo', 'data_nascimento', 'sexo', 'idade',
            'documento_identificacao',
            'telefone_principal', 'telefone_alternativo', 'email',
            'distrito', 'distrito_nome', 'provincia_nome',
            'endereco', 'latitude', 'longitude',
            'receber_alertas', 'canais_preferidos', 'idioma_preferido',
            'pessoa_vulneravel', 'tipo_vulnerabilidade', 'necessidades_especiais',
            'origem_registo', 'validado', 'ativo',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class PessoaRegistadaPublicSerializer(serializers.ModelSerializer):
    """Serializer para registo público (campos limitados)"""
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = PessoaRegistada
        fields = [
            'id', 'nome_completo', 'telefone_principal',
            'distrito', 'distrito_nome', 'endereco',
            'latitude', 'longitude',
            'pessoa_vulneravel', 'tipo_vulnerabilidade',
            'canais_preferidos', 'created_at',
        ]
        read_only_fields = ['created_at']

    def validate_telefone_principal(self, value):
        """Valida formato do número"""
        import re
        # Aceita formatos: +258XXXXXXXXX ou 258XXXXXXXXX
        limpo = re.sub(r'[^\d+]', '', value)
        if not limpo.startswith('+258') and not limpo.startswith('258'):
            raise serializers.ValidationError(
                'O número deve começar por +258 (Moçambique)'
            )
        if len(limpo.replace('+', '')) < 12:
            raise serializers.ValidationError('Número de telefone inválido')
        return value


class PessoaRegistadaGeoSerializer(GeoFeatureModelSerializer):
    """Serializer GeoJSON para o mapa"""
    class Meta:
        model = PessoaRegistada
        geo_field = 'geometria'
        fields = [
            'id', 'nome_completo', 'telefone_principal',
            'distrito', 'pessoa_vulneravel', 'ativo',
        ]