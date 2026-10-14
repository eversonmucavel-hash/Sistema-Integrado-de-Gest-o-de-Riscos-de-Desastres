"""
SIGRD - Modelos de Recursos, Doacoes e Distribuicoes
"""
from django.contrib.gis.db import models


class CategoriaRecurso(models.Model):
    """Categoria de recurso (agua, comida, kits, etc.)"""
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    unidade_medida = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'categorias_recurso'
        verbose_name = 'Categoria de Recurso'
        verbose_name_plural = 'Categorias de Recurso'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.unidade_medida})"


class Recurso(models.Model):
    """Recurso disponivel (stock)"""
    TIPO_DOADOR_CHOICES = [
        ('governo', 'Governo'),
        ('ong', 'ONG'),
        ('privado', 'Privado'),
        ('individual', 'Individual'),
        ('internacional', 'Internacional'),
    ]
    STATUS_CHOICES = [
        ('disponivel', 'Disponivel'),
        ('alocado', 'Alocado'),
        ('distribuido', 'Distribuido'),
        ('expirado', 'Expirado'),
    ]

    categoria = models.ForeignKey(
        CategoriaRecurso, on_delete=models.PROTECT, related_name='recursos'
    )
    evento = models.ForeignKey(
        'incidents.EventoDesastre', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='recursos'
    )
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)

    # Quantidade
    quantidade_disponivel = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    quantidade_alocada = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    quantidade_distribuida = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    unidade_medida = models.CharField(max_length=20, blank=True)

    # Localizacao
    distrito = models.ForeignKey(
        'geography.Distrito', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='recursos'
    )
    local_armazenamento = models.TextField(blank=True)
    geometria = models.PointField(srid=4326, null=True, blank=True)

    # Validade
    data_validade = models.DateField(null=True, blank=True)

    # Origem
    doador = models.CharField(max_length=200, blank=True)
    tipo_doador = models.CharField(max_length=50, choices=TIPO_DOADOR_CHOICES, blank=True)
    valor_estimado_mt = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # Datas
    data_recepcao = models.DateTimeField(auto_now_add=True)

    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='disponivel')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recursos'
        verbose_name = 'Recurso'
        verbose_name_plural = 'Recursos'
        ordering = ['-data_recepcao']

    def __str__(self):
        return f"{self.nome} ({self.quantidade_disponivel} {self.unidade_medida})"

    @property
    def quantidade_total(self):
        return self.quantidade_disponivel + self.quantidade_alocada + self.quantidade_distribuida


class Distribuicao(models.Model):
    """Registo de distribuicao de recursos"""
    recurso = models.ForeignKey(
        Recurso, on_delete=models.PROTECT, related_name='distribuicoes'
    )
    abrigo = models.ForeignKey(
        'shelters.Abrigo', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='distribuicoes'
    )
    equipa = models.ForeignKey(
        'teams.EquipaResposta', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='distribuicoes'
    )
    missao = models.ForeignKey(
        'teams.Missao', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='distribuicoes'
    )

    quantidade = models.DecimalField(max_digits=15, decimal_places=2)
    unidade_medida = models.CharField(max_length=20, blank=True)
    numero_beneficiarios = models.IntegerField(null=True, blank=True)

    data_distribuicao = models.DateTimeField(auto_now_add=True)

    # Responsavel
    responsavel_nome = models.CharField(max_length=200, blank=True)
    responsavel_telefone = models.CharField(max_length=50, blank=True)

    # Comprovacao
    comprovante_foto = models.TextField(blank=True)
    assinatura_digital = models.TextField(blank=True)

    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'distribuicoes'
        verbose_name = 'Distribuicao'
        verbose_name_plural = 'Distribuicoes'
        ordering = ['-data_distribuicao']

    def __str__(self):
        return f"{self.recurso.nome} -> {self.abrigo or self.equipa} ({self.quantidade})"