"""
SIGRD - Serializers da app Accounts
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile


class ProfileSerializer(serializers.ModelSerializer):
    total_usuarios = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'codigo', 'nome', 'descricao', 'nivel_acesso', 'total_usuarios', 'created_at']

    def get_total_usuarios(self, obj):
        return obj.usuarios.count()


class UserListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagens"""
    perfil_nome = serializers.CharField(source='perfil.nome', read_only=True)
    provincia_nome = serializers.CharField(source='provincia.nome', read_only=True)
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'nome_completo', 'email', 'telefone',
            'perfil', 'perfil_nome',
            'provincia', 'provincia_nome',
            'distrito', 'distrito_nome',
            'instituicao', 'cargo',
            'is_active', 'is_staff', 'verificado',
            'ultimo_login', 'created_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer completo do utilizador"""
    perfil_nome = serializers.CharField(source='perfil.nome', read_only=True)
    nivel_acesso = serializers.SerializerMethodField()
    provincia_nome = serializers.CharField(source='provincia.nome', read_only=True)
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'nome_completo', 'email', 'telefone',
            'perfil', 'perfil_nome', 'nivel_acesso',
            'provincia', 'provincia_nome',
            'distrito', 'distrito_nome',
            'instituicao', 'cargo',
            'is_active', 'is_staff', 'is_superuser', 'verificado',
            'ultimo_login', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'is_staff', 'is_superuser', 'ultimo_login',
            'created_at', 'updated_at',
        ]

    def get_nivel_acesso(self, obj):
        return obj.nivel_acesso


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para registo de utilizador"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'nome_completo', 'email', 'telefone',
            'password', 'password_confirm',
            'instituicao', 'cargo',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'As passwords nao coincidem.'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para mudanca de password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'As passwords nao coincidem.'})
        validate_password(attrs['new_password'])
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Password atual incorreta.')
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    """Serializer para o proprio utilizador (/me/)"""
    perfil_nome = serializers.CharField(source='perfil.nome', read_only=True)
    nivel_acesso = serializers.SerializerMethodField()
    provincia_nome = serializers.CharField(source='provincia.nome', read_only=True)
    distrito_nome = serializers.CharField(source='distrito.nome', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'nome_completo', 'email', 'telefone',
            'perfil', 'perfil_nome', 'nivel_acesso',
            'provincia', 'provincia_nome',
            'distrito', 'distrito_nome',
            'instituicao', 'cargo',
            'is_active', 'is_staff', 'verificado',
            'ultimo_login', 'created_at',
        ]
        read_only_fields = [
            'id', 'email', 'is_active', 'is_staff',
            'verificado', 'ultimo_login', 'created_at',
        ]

    def get_nivel_acesso(self, obj):
        return obj.nivel_acesso
    
    
# ============================================
# JWT - Custom Token Serializer (usa EMAIL em vez de username)
# ============================================
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer customizado que aceita 'email' em vez de 'username'
    """
    username_field = 'email'

    def validate(self, attrs):
        # Trocar 'username' por 'email' no dicionário de dados
        data = super().validate(attrs)

        # Adicionar dados do utilizador à resposta
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'nome_completo': self.user.nome_completo,
            'perfil': self.user.perfil.nome if self.user.perfil else None,
            'nivel_acesso': self.user.nivel_acesso,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View customizada que usa o serializer acima
    """
    serializer_class = CustomTokenObtainPairSerializer