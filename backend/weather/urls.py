"""
SIGRD - URLs da app Weather
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EstacaoMeteorologicaViewSet, LeituraMeteorologicaViewSet,
    PontoMedicaoRioViewSet, MedicaoNivelRioViewSet,
    ImagemSateliteViewSet,
)

router = DefaultRouter()
router.register(r'estacoes', EstacaoMeteorologicaViewSet, basename='estacao')
router.register(r'leituras', LeituraMeteorologicaViewSet, basename='leitura')
router.register(r'pontos-rio', PontoMedicaoRioViewSet, basename='ponto-rio')
router.register(r'medicoes-rio', MedicaoNivelRioViewSet, basename='medicao-rio')
router.register(r'imagens-satelite', ImagemSateliteViewSet, basename='imagem-satelite')

urlpatterns = [
    path('', include(router.urls)),
]