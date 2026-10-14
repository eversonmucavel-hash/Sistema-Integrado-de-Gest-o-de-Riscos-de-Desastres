"""
SIGRD - Modelo de Usuários e Perfis
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Profile(models.Model):
    """Perfil de acesso ao sistema"""
    NIVEL_CHOICES = [
        (10, 'Administrador do Sistema'),
        (9, 'Gestor INGD Nacional'),
        (8, 'Gestor CENOE'),
        (7, 'Gestor Provincial'),
        (5, 'Gestor Distrital'),
        (4, 'Coordenador de Campo'),
        (3, 'Agente de Campo'),
        (1, 'Visualizador Público'),
    ]

    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    nivel_acesso = models.IntegerField(choices=NIVEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'perfis_usuario'
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'

    def __str__(self):
        return f"{self.codigo} - {self.nome}"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Usuário do sistema SIGRD"""
    # Dados pessoais
    nome_completo = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=50, blank=True)

    # Perfil e localização
    perfil = models.ForeignKey(
        Profile, on_delete=models.PROTECT, null=True, blank=True, related_name='usuarios'
    )
    provincia = models.ForeignKey(
        'geography.Provincia', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='usuarios'
    )
    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='usuarios'
    )

    # Instituição
    instituicao = models.CharField(max_length=200, blank=True)
    cargo = models.CharField(max_length=100, blank=True)

    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    verificado = models.BooleanField(default=False)
    ultimo_login = models.DateTimeField(null=True, blank=True)

    # Datas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome_completo']

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['nome_completo']

    def __str__(self):
        return f"{self.nome_completo} ({self.email})"

    @property
    def nivel_acesso(self):
        return self.perfil.nivel_acesso if self.perfil else 0