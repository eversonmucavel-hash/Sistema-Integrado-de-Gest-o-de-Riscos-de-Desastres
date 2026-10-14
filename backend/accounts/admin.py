from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nome', 'nivel_acesso', 'created_at')
    list_filter = ('nivel_acesso',)
    search_fields = ('codigo', 'nome')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'nome_completo', 'perfil', 'instituicao', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'perfil')
    search_fields = ('email', 'nome_completo', 'telefone')
    ordering = ('nome_completo',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Dados Pessoais', {'fields': ('nome_completo', 'telefone')}),
        ('Perfil e Localizacao', {'fields': ('perfil', 'provincia', 'distrito')}),
        ('Instituicao', {'fields': ('instituicao', 'cargo')}),
        ('Permissoes', {'fields': ('is_active', 'is_staff', 'is_superuser', 'verificado', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('ultimo_login', 'created_at', 'updated_at')}),
    )

    readonly_fields = ('created_at', 'updated_at', 'ultimo_login')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nome_completo', 'password1', 'password2'),
        }),
    )