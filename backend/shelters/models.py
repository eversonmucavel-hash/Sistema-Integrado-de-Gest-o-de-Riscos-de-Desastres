"""
SIGRD - Modelos de Abrigos e Infraestruturas
"""
from django.contrib.gis.db import models


class CategoriaInfraestrutura(models.Model):
    """Categoria de infraestrutura (abrigo, hospital, escola, etc.)"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    icone = models.CharField(max_length=50, blank=True)
    cor = models.CharField(max_length=7, blank=True)

    class Meta:
        db_table = 'categorias_infraestrutura'
        verbose_name = 'Categoria de Infraestrutura'
        verbose_name_plural = 'Categorias de Infraestrutura'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Infraestrutura(models.Model):
    """Infraestrutura critica no terreno"""
    CONDICAO_CHOICES = [
        ('otima', 'Otima'),
        ('boa', 'Boa'),
        ('regular', 'Regular'),
        ('precaria', 'Precaria'),
        ('destruida', 'Destruida'),
    ]

    categoria = models.ForeignKey(
        CategoriaInfraestrutura, on_delete=models.PROTECT, related_name='infraestruturas'
    )
    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.CASCADE, related_name='infraestruturas'
    )
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    endereco = models.TextField(blank=True)

    geometria = models.PointField(srid=4326)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    altitude_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Contactos
    telefone = models.CharField(max_length=50, blank=True)
    email = models.CharField(max_length=100, blank=True)
    responsavel = models.CharField(max_length=200, blank=True)

    # Capacidade
    capacidade_pessoas = models.IntegerField(null=True, blank=True)
    capacidade_atual = models.IntegerField(default=0)

    # Estado
    operacional = models.BooleanField(default=True)
    condicao = models.CharField(max_length=50, choices=CONDICAO_CHOICES, blank=True)

    # Recursos
    recursos = models.JSONField(null=True, blank=True)

    # Risco
    em_area_risco = models.BooleanField(default=False)
    area_risco = models.ForeignKey(
        'risks.AreaRisco', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='infraestruturas_afetadas'
    )
    nivel_vulnerabilidade = models.CharField(max_length=20, blank=True)

    # Metadata
    fonte_dados = models.CharField(max_length=100, blank=True)
    precisao_gps_metros = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    validado = models.BooleanField(default=False)
    ultima_inspecao = models.DateField(null=True, blank=True)
    ativo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'infraestruturas'
        verbose_name = 'Infraestrutura'
        verbose_name_plural = 'Infraestruturas'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.categoria.nome})"


class Abrigo(models.Model):
    """Abrigo / centro de acomodacao"""
    TIPO_CHOICES = [
        ('temporario', 'Temporario'),
        ('permanente', 'Permanente'),
        ('emergencia', 'Emergencia'),
    ]
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('lotado', 'Lotado'),
        ('fechado', 'Fechado'),
        ('em_preparacao', 'Em Preparacao'),
    ]
    CONDICAO_CHOICES = [
        ('otima', 'Otima'),
        ('boa', 'Boa'),
        ('regular', 'Regular'),
        ('precaria', 'Precaria'),
    ]

    infraestrutura = models.ForeignKey(
        Infraestrutura, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='abrigos'
    )
    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.CASCADE, related_name='abrigos'
    )
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='abrigos'
    )

    nome = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)

    geometria = models.PointField(srid=4326)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    endereco = models.TextField(blank=True)

    # Capacidade
    capacidade_maxima = models.IntegerField()
    ocupacao_atual = models.IntegerField(default=0)
    disponibilidade_percentual = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )

    # Estado
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='em_preparacao')
    condicao = models.CharField(max_length=50, choices=CONDICAO_CHOICES, blank=True)

    # Infraestrutura
    tem_agua = models.BooleanField(default=False)
    tem_energia = models.BooleanField(default=False)
    tem_saneamento = models.BooleanField(default=False)
    tem_cozinha = models.BooleanField(default=False)
    tem_area_saude = models.BooleanField(default=False)

    # Recursos
    recursos = models.JSONField(null=True, blank=True)

    # Gestao
    responsavel = models.CharField(max_length=200, blank=True)
    telefone_contacto = models.CharField(max_length=50, blank=True)

    # Datas
    data_abertura = models.DateTimeField(null=True, blank=True)
    data_encerramento = models.DateTimeField(null=True, blank=True)
    ativo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'abrigos'
        verbose_name = 'Abrigo'
        verbose_name_plural = 'Abrigos'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.ocupacao_atual}/{self.capacidade_maxima})"

    def save(self, *args, **kwargs):
        # Calcular disponibilidade e status automaticamente
        if self.capacidade_maxima and self.capacidade_maxima > 0:
            self.disponibilidade_percentual = (
                (self.capacidade_maxima - self.ocupacao_atual) / self.capacidade_maxima
            ) * 100

            if self.ocupacao_atual >= self.capacidade_maxima:
                self.status = 'lotado'
            elif self.ocupacao_atual > 0 and self.status not in ['fechado', 'em_preparacao']:
                self.status = 'aberto'

        super().save(*args, **kwargs)