"""
SIGRD - URLs da app Teams
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoEquipaViewSet,
    EquipaRespostaViewSet,
    MissaoViewSet,
    RastreamentoGPSViewSet,
)

router = DefaultRouter()
router.register(r'tipos-equipa', TipoEquipaViewSet, basename='tipo-equipa')
router.register(r'equipas', EquipaRespostaViewSet, basename='equipa')
router.register(r'missoes', MissaoViewSet, basename='missao')
router.register(r'rastreamento', RastreamentoGPSViewSet, basename='rastreamento')

urlpatterns = [
    path('', include(router.urls)),
]