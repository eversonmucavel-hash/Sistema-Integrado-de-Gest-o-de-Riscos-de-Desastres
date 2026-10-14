"""
SIGRD - Modelos Meteorologicos (INAM), Rios (INAMI) e Imagens de Satelite
"""
from django.contrib.gis.db import models


class EstacaoMeteorologica(models.Model):
    """Estacao meteorologica (INAM)"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, blank=True)

    geometria = models.PointField(srid=4326)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    altitude_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='estacoes_meteo'
    )
    operacional = models.BooleanField(default=True)
    ultima_leitura = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'estacoes_meteorologicas'
        verbose_name = 'Estacao Meteorologica'
        verbose_name_plural = 'Estacoes Meteorologicas'
        ordering = ['nome']

    def __str__(self):
        return f"{self.codigo} - {self.nome}"


class LeituraMeteorologica(models.Model):
    """Leitura de uma estacao meteorologica"""
    estacao = models.ForeignKey(
        EstacaoMeteorologica, on_delete=models.CASCADE, related_name='leituras'
    )
    timestamp_leitura = models.DateTimeField()

    temperatura_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    umidade_percentual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    precipitacao_mm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    velocidade_vento_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    direcao_vento_graus = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    pressao_atmosferica_hpa = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)

    precipitacao_24h_mm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    precipitacao_7dias_mm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leituras_meteorologicas'
        verbose_name = 'Leitura Meteorologica'
        verbose_name_plural = 'Leituras Meteorologicas'
        ordering = ['-timestamp_leitura']
        indexes = [
            models.Index(fields=['estacao', '-timestamp_leitura']),
        ]

    def __str__(self):
        return f"{self.estacao.codigo} @ {self.timestamp_leitura}"


class PontoMedicaoRio(models.Model):
    """Ponto de medicao de nivel de rio (INAMI)"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=200)
    rio = models.CharField(max_length=200, blank=True)

    geometria = models.PointField(srid=4326)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    altitude_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='pontos_rio'
    )
    nivel_alerta_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    nivel_perigo_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    operacional = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pontos_medicao_rio'
        verbose_name = 'Ponto de Medicao de Rio'
        verbose_name_plural = 'Pontos de Medicao de Rio'
        ordering = ['rio', 'nome']

    def __str__(self):
        return f"{self.rio} - {self.nome}"


class MedicaoNivelRio(models.Model):
    """Medicao de nivel de agua num ponto de rio"""
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('atencao', 'Atencao'),
        ('alerta', 'Alerta'),
        ('perigo', 'Perigo'),
        ('critico', 'Critico'),
    ]

    ponto = models.ForeignKey(
        PontoMedicaoRio, on_delete=models.CASCADE, related_name='medicoes'
    )
    timestamp_medicao = models.DateTimeField()

    nivel_agua_m = models.DecimalField(max_digits=6, decimal_places=2)
    vazao_m3_s = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status_alerta = models.CharField(max_length=20, choices=STATUS_CHOICES, default='normal')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medicoes_nivel_rio'
        verbose_name = 'Medicao de Nivel de Rio'
        verbose_name_plural = 'Medicoes de Nivel de Rio'
        ordering = ['-timestamp_medicao']
        indexes = [
            models.Index(fields=['ponto', '-timestamp_medicao']),
            models.Index(fields=['status_alerta']),
        ]

    def __str__(self):
        return f"{self.ponto.nome} = {self.nivel_agua_m}m [{self.status_alerta}]"


class ImagemSatelite(models.Model):
    """Imagem de satelite ou drone"""
    fonte = models.CharField(max_length=50, blank=True)
    tipo = models.CharField(max_length=50, blank=True)

    geometria = models.PolygonField(srid=4326)
    area_km2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    data_aquisicao = models.DateTimeField()
    resolucao_metros = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    cobertura_nuvens_percentual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # URLs
    url_preview = models.TextField(blank=True)
    url_download = models.TextField(blank=True)
    url_wms = models.TextField(blank=True)

    # Associacao
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='imagens_satelite'
    )

    processada = models.BooleanField(default=False)
    analise = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'imagens_satelite'
        verbose_name = 'Imagem de Satelite'
        verbose_name_plural = 'Imagens de Satelite'
        ordering = ['-data_aquisicao']

    def __str__(self):
        return f"{self.fonte} @ {self.data_aquisicao}"