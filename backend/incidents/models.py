"""
SIGRD - Modelos de Incidentes / Eventos de Desastre
"""
from django.contrib.gis.db import models


class EventoDesastre(models.Model):
    """Evento de desastre (ciclone, cheia, seca, etc.)"""
    INTENSIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('moderada', 'Moderada'),
        ('alta', 'Alta'),
        ('extrema', 'Extrema'),
    ]
    NIVEL_ALERTA_CHOICES = [
        ('verde', 'Verde'),
        ('amarelo', 'Amarelo'),
        ('laranja', 'Laranja'),
        ('vermelho', 'Vermelho'),
    ]
    ESTADO_CHOICES = [
        ('monitoramento', 'Monitoramento'),
        ('alerta', 'Alerta'),
        ('emergencia', 'Emergencia'),
        ('recuperacao', 'Recuperacao'),
        ('encerrado', 'Encerrado'),
    ]

    codigo_evento = models.CharField(max_length=50, unique=True)
    tipo_risco = models.ForeignKey(
        'risks.TipoRisco', on_delete=models.PROTECT, related_name='eventos'
    )
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    categoria = models.CharField(max_length=50, blank=True)
    intensidade = models.CharField(max_length=20, choices=INTENSIDADE_CHOICES, blank=True)

    # Temporal
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField(null=True, blank=True)
    duracao_horas = models.IntegerField(null=True, blank=True)
    ativo = models.BooleanField(default=True)

    # Espacial
    geometria = models.MultiPolygonField(srid=4326, null=True, blank=True)
    area_afetada_km2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    distritos_afetados = models.JSONField(null=True, blank=True, default=list)

    # Impacto
    pessoas_afetadas = models.IntegerField(default=0)
    pessoas_deslocadas = models.IntegerField(default=0)
    mortes = models.IntegerField(default=0)
    feridos = models.IntegerField(default=0)
    habitacoes_destruidas = models.IntegerField(default=0)
    habitacoes_danificadas = models.IntegerField(default=0)

    # Dados meteorologicos
    velocidade_vento_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    precipitacao_mm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    nivel_agua_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Status de resposta
    nivel_alerta = models.CharField(max_length=20, choices=NIVEL_ALERTA_CHOICES, default='verde')
    estado_resposta = models.CharField(max_length=50, choices=ESTADO_CHOICES, default='monitoramento')

    # Coordenacao
    coordenador_responsavel = models.CharField(max_length=200, blank=True)
    cenoe_ativado = models.BooleanField(default=False)
    fonte_informacao = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'eventos_desastre'
        verbose_name = 'Evento de Desastre'
        verbose_name_plural = 'Eventos de Desastre'
        ordering = ['-data_inicio']

    def __str__(self):
        return f"{self.codigo_evento} - {self.nome}"