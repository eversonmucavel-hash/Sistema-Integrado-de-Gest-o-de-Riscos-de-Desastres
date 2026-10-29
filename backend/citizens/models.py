"""
SIGRD - Modelos da app Citizens
Cidadãos registados que podem receber alertas por SMS
"""
from django.contrib.gis.db import models


class PessoaRegistada(models.Model):
    """Cidadão registado para receber alertas de desastres"""

    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
    ]

    CANAIS_CHOICES = [
        ('SMS', 'SMS'),
        ('APP', 'App móvel'),
        ('EMAIL', 'Email'),
        ('RADIO', 'Rádio'),
    ]

    VULNERABILIDADE_CHOICES = [
        ('idoso', 'Idoso'),
        ('crianca', 'Criança'),
        ('gestante', 'Gestante'),
        ('deficiente', 'Pessoa com deficiência'),
        ('doente_cronico', 'Doente crónico'),
    ]

    # ============================================
    # DADOS PESSOAIS
    # ============================================
    nome_completo = models.CharField(max_length=200)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, blank=True)
    documento_identificacao = models.CharField(max_length=50, blank=True)

    # ============================================
    # CONTACTOS
    # ============================================
    telefone_principal = models.CharField(
        max_length=20, db_index=True,
        help_text='Formato internacional: +258XXXXXXXXX'
    )
    telefone_alternativo = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    # ============================================
    # LOCALIZAÇÃO
    # ============================================
    distrito = models.ForeignKey(
        'geography.Distrito',
        on_delete=models.SET_NULL,
        null=True,
        related_name='cidadãos_registados',
    )
    endereco = models.TextField(blank=True, help_text='Endereço/localidade')
    geometria = models.PointField(
        srid=4326, null=True, blank=True,
        help_text='Coordenadas GPS da residência'
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    # ============================================
    # PREFERÊNCIAS DE ALERTA
    # ============================================
    receber_alertas = models.BooleanField(default=True)
    canais_preferidos = models.JSONField(
        default=list, blank=True,
        help_text="Ex: ['SMS', 'APP']"
    )
    idioma_preferido = models.CharField(max_length=10, default='pt')

    # ============================================
    # VULNERABILIDADES
    # ============================================
    pessoa_vulneravel = models.BooleanField(default=False)
    tipo_vulnerabilidade = models.JSONField(
        default=list, blank=True,
        help_text="Ex: ['idoso', 'gestante']"
    )
    necessidades_especiais = models.TextField(blank=True)

    # ============================================
    # AGRUPAMENTO FAMILIAR (futuro)
    # ============================================
    # numero_pessoas_agregado_familiar = models.IntegerField(default=1)
    # responsavel_familia = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    # ============================================
    # ESTADO / METADATA
    # ============================================
    origem_registo = models.CharField(
        max_length=50, blank=True,
        help_text='website, app, posto_administrativo, importacao'
    )
    validado = models.BooleanField(default=False)
    ativo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pessoas_registadas'
        verbose_name = 'Pessoa Registada'
        verbose_name_plural = 'Pessoas Registadas'
        ordering = ['nome_completo']
        indexes = [
            models.Index(fields=['telefone_principal']),
            models.Index(fields=['distrito']),
            models.Index(fields=['ativo']),
        ]

    def __str__(self):
        return f'{self.nome_completo} ({self.telefone_principal})'

    @property
    def idade(self):
        """Calcula idade em anos"""
        if not self.data_nascimento:
            return None
        from datetime import date
        hoje = date.today()
        anos = hoje.year - self.data_nascimento.year
        if (hoje.month, hoje.day) < (self.data_nascimento.month, self.data_nascimento.day):
            anos -= 1
        return anos

    def save(self, *args, **kwargs):
        """Se tem geometria mas não lat/lng, extrai automaticamente"""
        if self.geometria and (not self.latitude or not self.longitude):
            self.latitude = self.geometria.y
            self.longitude = self.geometria.x
        elif self.latitude and self.longitude and not self.geometria:
            from django.contrib.gis.geos import Point
            self.geometria = Point(
                float(self.longitude), float(self.latitude), srid=4326
            )
        super().save(*args, **kwargs)