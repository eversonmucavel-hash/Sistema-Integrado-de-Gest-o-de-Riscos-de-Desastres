"""
SIGRD - Modelos de Riscos
Tipos de risco, areas de risco, areas seguras, rotas de evacuacao
"""
from django.contrib.gis.db import models


class TipoRisco(models.Model):
    """Tipos de risco (Ciclone, Cheia, Seca, etc.)"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    cor_mapa = models.CharField(max_length=7, default='#FF0000')
    icone = models.CharField(max_length=50, blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = 'tipos_risco'
        verbose_name = 'Tipo de Risco'
        verbose_name_plural = 'Tipos de Risco'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class AreaRisco(models.Model):
    """Area geografica de risco"""
    NIVEL_CHOICES = [
        ('baixo', 'Baixo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
        ('critico', 'Critico'),
    ]
    PROBABILIDADE_CHOICES = [
        ('rara', 'Rara'),
        ('possivel', 'Possivel'),
        ('provavel', 'Provavel'),
        ('certa', 'Certa'),
    ]
    IMPACTO_CHOICES = [
        ('minimo', 'Minimo'),
        ('moderado', 'Moderado'),
        ('grave', 'Grave'),
        ('catastrofico', 'Catastrofico'),
    ]

    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.CASCADE, related_name='areas_risco'
    )
    tipo_risco = models.ForeignKey(
        TipoRisco, on_delete=models.PROTECT, related_name='areas'
    )

    nome_area = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)

    # Geometria
    geometria = models.PolygonField(srid=4326)
    area_m2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    perimetro_m = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # Classificacao
    nivel_risco = models.CharField(max_length=20, choices=NIVEL_CHOICES)
    probabilidade = models.CharField(max_length=20, choices=PROBABILIDADE_CHOICES, blank=True)
    impacto = models.CharField(max_length=20, choices=IMPACTO_CHOICES, blank=True)

    # Populacao exposta
    populacao_exposta = models.IntegerField(null=True, blank=True)
    familias_expostas = models.IntegerField(null=True, blank=True)

    # Infraestruturas em risco
    escolas_em_risco = models.IntegerField(default=0)
    centros_saude_em_risco = models.IntegerField(default=0)
    habitacoes_em_risco = models.IntegerField(default=0)

    # Validacao
    validado = models.BooleanField(default=False)
    validado_por = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True
    )
    data_validacao = models.DateTimeField(null=True, blank=True)
    fonte_dados = models.CharField(max_length=100, blank=True)
    precisao_metros = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Metadata
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'areas_risco'
        verbose_name = 'Area de Risco'
        verbose_name_plural = 'Areas de Risco'
        ordering = ['-nivel_risco', 'nome_area']

    def __str__(self):
        return f"{self.nome_area} - {self.nivel_risco}"


class AreaSegura(models.Model):
    """Area segura / zona de evacuacao"""
    TIPO_CHOICES = [
        ('zona_alta', 'Zona Alta'),
        ('area_protegida', 'Area Protegida'),
        ('zona_evacuacao', 'Zona de Evacuacao'),
    ]

    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.CASCADE, related_name='areas_seguras'
    )
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)

    geometria = models.PolygonField(srid=4326)
    area_m2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    altitude_media_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    capacidade_pessoas = models.IntegerField(null=True, blank=True)
    acessibilidade = models.CharField(max_length=200, blank=True)

    # Recursos
    tem_agua_potavel = models.BooleanField(default=False)
    tem_energia = models.BooleanField(default=False)
    tem_comunicacao = models.BooleanField(default=False)
    tem_saneamento = models.BooleanField(default=False)

    # Centroide
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    validado = models.BooleanField(default=False)
    ultima_inspecao = models.DateField(null=True, blank=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'areas_seguras'
        verbose_name = 'Area Segura'
        verbose_name_plural = 'Areas Seguras'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class RotaEvacuacao(models.Model):
    """Rota de evacuacao entre area de risco e area segura"""
    CONDICAO_CHOICES = [
        ('otima', 'Otima'),
        ('boa', 'Boa'),
        ('regular', 'Regular'),
        ('precaria', 'Precaria'),
    ]

    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.CASCADE, related_name='rotas_evacuacao'
    )
    area_origem = models.ForeignKey(
        AreaRisco, on_delete=models.SET_NULL, null=True, blank=True, related_name='rotas_saida'
    )
    area_destino = models.ForeignKey(
        AreaSegura, on_delete=models.SET_NULL, null=True, blank=True, related_name='rotas_entrada'
    )

    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)

    geometria = models.LineStringField(srid=4326)
    distancia_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tempo_estimado_minutos = models.IntegerField(null=True, blank=True)

    # Caracteristicas
    largura_media_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    tipo_superficie = models.CharField(max_length=50, blank=True)
    condicao = models.CharField(max_length=50, choices=CONDICAO_CHOICES, blank=True)
    acessivel_veiculos = models.BooleanField(default=False)
    iluminacao = models.BooleanField(default=False)

    # Pontos de referencia (JSON)
    pontos_referencia = models.JSONField(null=True, blank=True)

    # Validacao
    ultima_verificacao = models.DateField(null=True, blank=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rotas_evacuacao'
        verbose_name = 'Rota de Evacuacao'
        verbose_name_plural = 'Rotas de Evacuacao'
        ordering = ['nome']

    def __str__(self):
        return self.nome