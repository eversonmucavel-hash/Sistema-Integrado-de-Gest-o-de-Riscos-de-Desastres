from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Provincia, Distrito


@admin.register(Provincia)
class ProvinciaAdmin(GISModelAdmin):
    list_display = ('codigo', 'nome', 'capital', 'area_km2', 'populacao_estimada')
    search_fields = ('codigo', 'nome', 'capital')
    ordering = ('nome',)


@admin.register(Distrito)
class DistritoAdmin(GISModelAdmin):
    list_display = ('codigo', 'nome', 'provincia', 'nivel_risco', 'populacao_estimada')
    list_filter = ('nivel_risco', 'provincia')
    search_fields = ('codigo', 'nome')
    ordering = ('provincia', 'nome')