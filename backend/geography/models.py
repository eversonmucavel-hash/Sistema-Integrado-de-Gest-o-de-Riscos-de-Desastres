"""
SIGRD - Modelos Geográficos
"""
from django.contrib.gis.db import models


class Provincia(models.Model):
    """Província de Moçambique"""
    codigo = models.CharField(max_length=10, unique=True)
    nome = models.CharField(max_length=100)
    capital = models.CharField(max_length=100, blank=True)
    area_km2 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    populacao_estimada = models.IntegerField(null=True, blank=True)
    geometria = models.MultiPolygonField(srid=4326, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'provincias'
        verbose_name = 'Província'
        verbose_name_plural = 'Províncias'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Distrito(models.Model):
    """Distrito de Moçambique"""
    NIVEL_RISCO_CHOICES = [
        ('baixo', 'Baixo'),
        ('medio', 'Médio'),
        ('alto', 'Alto'),
        ('critico', 'Crítico'),
    ]

    provincia = models.ForeignKey(Provincia, on_delete=models.CASCADE, related_name='distritos')
    codigo = models.CharField(max_length=10, unique=True)
    nome = models.CharField(max_length=100)
    area_km2 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    populacao_estimada = models.IntegerField(null=True, blank=True)
    geometria = models.MultiPolygonField(srid=4326, null=True, blank=True)
    nivel_risco = models.CharField(max_length=20, choices=NIVEL_RISCO_CHOICES, blank=True)
    ultima_avaliacao_risco = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'distritos'
        verbose_name = 'Distrito'
        verbose_name_plural = 'Distritos'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.provincia.nome})"