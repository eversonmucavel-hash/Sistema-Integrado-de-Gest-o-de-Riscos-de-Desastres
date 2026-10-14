"""
SIGRD - Modelos de Equipas de Resposta, Missoes e Rastreamento GPS
"""
from django.contrib.gis.db import models


class TipoEquipa(models.Model):
    """Tipos de equipa de resposta"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)

    class Meta:
        db_table = 'tipos_equipa'
        verbose_name = 'Tipo de Equipa'
        verbose_name_plural = 'Tipos de Equipa'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class EquipaResposta(models.Model):
    """Equipa de resposta no terreno"""
    STATUS_CHOICES = [
        ('standby', 'Standby'),
        ('em_missao', 'Em Missao'),
        ('descansando', 'Descansando'),
        ('indisponivel', 'Indisponivel'),
    ]

    tipo_equipa = models.ForeignKey(
        TipoEquipa, on_delete=models.PROTECT, related_name='equipas'
    )
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='equipas'
    )
    codigo_equipa = models.CharField(max_length=50, unique=True)
    nome = models.CharField(max_length=200)
    instituicao = models.CharField(max_length=200, blank=True)

    # Lider
    lider_nome = models.CharField(max_length=200, blank=True)
    lider_telefone = models.CharField(max_length=50, blank=True)
    numero_membros = models.IntegerField(null=True, blank=True)

    # Localizacao atual
    geometria = models.PointField(srid=4326, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    ultima_atualizacao_gps = models.DateTimeField(null=True, blank=True)

    # Distrito de atuacao
    distrito_atuacao = models.ForeignKey(
        'geography.Distrito', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='equipas_atuando'
    )
    area_atuacao = models.PolygonField(srid=4326, null=True, blank=True)

    # Recursos
    veiculo = models.CharField(max_length=100, blank=True)
    equipamentos = models.JSONField(null=True, blank=True, default=list)
    capacidade_atendimento = models.IntegerField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='standby')
    missao_atual = models.TextField(blank=True)

    # Datas
    data_ativacao = models.DateTimeField(null=True, blank=True)
    data_desativacao = models.DateTimeField(null=True, blank=True)
    ativo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'equipas_resposta'
        verbose_name = 'Equipa de Resposta'
        verbose_name_plural = 'Equipas de Resposta'
        ordering = ['nome']

    def __str__(self):
        return f"{self.codigo_equipa} - {self.nome} [{self.status}]"


class Missao(models.Model):
    """Missao atribuida a uma equipa"""
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('critica', 'Critica'),
    ]
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluida'),
        ('cancelada', 'Cancelada'),
    ]

    equipa = models.ForeignKey(
        EquipaResposta, on_delete=models.CASCADE, related_name='missoes'
    )
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='missoes'
    )
    codigo_missao = models.CharField(max_length=50, unique=True)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    tipo = models.CharField(max_length=50, blank=True)

    # Localizacao
    geometria = models.PointField(srid=4326, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    endereco = models.TextField(blank=True)

    # Temporal
    data_atribuicao = models.DateTimeField(auto_now_add=True)
    data_inicio = models.DateTimeField(null=True, blank=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    duracao_minutos = models.IntegerField(null=True, blank=True)

    # Prioridade e status
    prioridade = models.CharField(max_length=20, choices=PRIORIDADE_CHOICES, default='normal')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pendente')

    # Resultados
    pessoas_atendidas = models.IntegerField(default=0)
    pessoas_resgatadas = models.IntegerField(default=0)
    recursos_distribuidos = models.JSONField(null=True, blank=True)

    # Relatorio
    relatorio = models.TextField(blank=True)
    fotos = models.JSONField(null=True, blank=True, default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'missoes'
        verbose_name = 'Missao'
        verbose_name_plural = 'Missoes'
        ordering = ['-data_atribuicao']

    def __str__(self):
        return f"{self.codigo_missao} - {self.titulo}"


class RastreamentoGPS(models.Model):
    """Historico de rastreamento GPS das equipas"""
    equipa = models.ForeignKey(
        EquipaResposta, on_delete=models.CASCADE, related_name='rastreamentos'
    )
    missao = models.ForeignKey(
        Missao, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='rastreamentos'
    )

    geometria = models.PointField(srid=4326)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    altitude_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    precisao_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    velocidade_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    direcao_graus = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)
    dispositivo = models.CharField(max_length=100, blank=True)
    app_version = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'rastreamento_gps'
        verbose_name = 'Rastreamento GPS'
        verbose_name_plural = 'Rastreamentos GPS'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.equipa.codigo_equipa} @ {self.timestamp}"