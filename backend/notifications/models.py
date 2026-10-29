"""
SIGRD - Modelos de Notificações
"""
from django.db import models


class NotificacaoSMS(models.Model):
    """Registo de SMS enviados"""
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('enviado', 'Enviado'),
        ('entregue', 'Entregue'),
        ('falhou', 'Falhou'),
    ]

    BACKEND_CHOICES = [
        ('console', 'Console (dev)'),
        ('twilio', 'Twilio'),
    ]

    # Destinatário
    numero = models.CharField(max_length=20, db_index=True)
    mensagem = models.TextField()

    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    backend = models.CharField(max_length=20, choices=BACKEND_CHOICES, default='console')

    # Twilio
    sid_externo = models.CharField(max_length=100, blank=True, null=True)

    # Erro (se falhou)
    erro = models.TextField(blank=True, null=True)
    tentativas = models.IntegerField(default=0)

    # Associação
    alerta = models.ForeignKey(
        'alerts.Alerta',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificacoes_sms',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    enviado_em = models.DateTimeField(null=True, blank=True)
    entregue_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notificacoes_sms'
        verbose_name = 'Notificação SMS'
        verbose_name_plural = 'Notificações SMS'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.numero} - {self.status}'

    def to_dict(self):
        return {
            'id': self.id,
            'numero': self.numero,
            'status': self.status,
            'backend': self.backend,
            'sid_externo': self.sid_externo,
            'erro': self.erro,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }