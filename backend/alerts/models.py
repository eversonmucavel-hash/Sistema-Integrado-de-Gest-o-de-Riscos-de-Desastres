"""
SIGRD - Modelos de Alertas
"""
from django.contrib.gis.db import models


class Alerta(models.Model):
    """Alerta emitido para um evento"""
    NIVEL_CHOICES = [
        ('informativo', 'Informativo'),
        ('atencao', 'Atencao'),
        ('urgente', 'Urgente'),
        ('critico', 'Critico'),
    ]

    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.CASCADE,
        null=True, blank=True, related_name='alertas'
    )
    tipo_risco = models.ForeignKey(
        'risks.TipoRisco', on_delete=models.PROTECT, related_name='alertas'
    )

    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()

    # Classificacao
    nivel = models.CharField(max_length=20, choices=NIVEL_CHOICES)
    prioridade = models.IntegerField(null=True, blank=True)

    # Espacial
    geometria = models.MultiPolygonField(srid=4326, null=True, blank=True)
    distritos_alvo = models.JSONField(null=True, blank=True, default=list)
    raio_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Temporal
    data_emissao = models.DateTimeField(auto_now_add=True)
    valido_ate = models.DateTimeField(null=True, blank=True)

    # Instrucoes
    acoes_recomendadas = models.JSONField(null=True, blank=True, default=list)
    areas_evacuacao = models.TextField(blank=True)

    # Distribuicao
    canais = models.JSONField(null=True, blank=True, default=list)
    total_destinatarios = models.IntegerField(default=0)
    total_enviados = models.IntegerField(default=0)
    total_confirmados = models.IntegerField(default=0)

    # Metadata
    emitido_por = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='alertas_emitidos'
    )
    emitido_por_entidade = models.CharField(max_length=100, blank=True)
    cancelado = models.BooleanField(default=False)
    data_cancelamento = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alertas'
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        ordering = ['-data_emissao']

    def __str__(self):
        return f"{self.titulo} [{self.nivel}]"


class AlertaEnviado(models.Model):
    """Log de alertas enviados individualmente"""
    CANAL_CHOICES = [
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('APP', 'App'),
        ('WEB', 'Web'),
        ('RADIO', 'Radio'),
        ('USSD', 'USSD'),
    ]
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('enviado', 'Enviado'),
        ('entregue', 'Entregue'),
        ('falhou', 'Falhou'),
        ('lido', 'Lido'),
    ]

    alerta = models.ForeignKey(Alerta, on_delete=models.CASCADE, related_name='envios')
    destinatario = models.CharField(max_length=200, blank=True)
    canal = models.CharField(max_length=20, choices=CANAL_CHOICES)
    mensagem_enviada = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    data_envio = models.DateTimeField(null=True, blank=True)
    data_entrega = models.DateTimeField(null=True, blank=True)
    data_leitura = models.DateTimeField(null=True, blank=True)

    erro = models.TextField(blank=True)
    tentativas = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alertas_enviados'
        verbose_name = 'Alerta Enviado'
        verbose_name_plural = 'Alertas Enviados'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alerta.titulo} -> {self.destinatario} [{self.status}]"