"""
SIGRD - Modelos de Deslocados
"""
from django.db import models


class Deslocado(models.Model):
    """Pessoa deslocada num abrigo"""
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
    ]
    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('saiu', 'Saiu'),
        ('transferido', 'Transferido'),
        ('falecido', 'Falecido'),
    ]

    abrigo = models.ForeignKey(
        'shelters.Abrigo', on_delete=models.CASCADE, related_name='deslocados'
    )
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='deslocados'
    )

    # Dados pessoais
    nome_completo = models.CharField(max_length=200)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, blank=True)
    documento_identificacao = models.CharField(max_length=50, blank=True)
    telefone = models.CharField(max_length=20, blank=True)

    # Origem
    distrito_origem = models.CharField(max_length=100, blank=True)
    localidade_origem = models.CharField(max_length=100, blank=True)
    endereco_origem = models.TextField(blank=True)

    # Vulnerabilidades
    vulneravel = models.BooleanField(default=False)
    tipo_vulnerabilidade = models.JSONField(null=True, blank=True, default=list)
    necessidades_especiais = models.TextField(blank=True)

    # Agregado familiar
    numero_acompanhantes = models.IntegerField(default=0)
    nomes_acompanhantes = models.JSONField(null=True, blank=True, default=list)

    # Datas
    data_entrada = models.DateTimeField(auto_now_add=True)
    data_saida = models.DateTimeField(null=True, blank=True)

    # Destino
    distrito_destino = models.CharField(max_length=100, blank=True)
    endereco_destino = models.TextField(blank=True)

    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ativo')
    observacoes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deslocados'
        verbose_name = 'Deslocado'
        verbose_name_plural = 'Deslocados'
        ordering = ['-data_entrada']

    def __str__(self):
        return f"{self.nome_completo} ({self.abrigo.nome})"