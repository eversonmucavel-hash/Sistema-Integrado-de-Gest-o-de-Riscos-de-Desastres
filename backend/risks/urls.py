"""
SIGRD - URLs da app Risks
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoRiscoViewSet,
    AreaRiscoViewSet,
    AreaSeguraViewSet,
    RotaEvacuacaoViewSet,
)

router = DefaultRouter()
router.register(r'tipos-risco', TipoRiscoViewSet, basename='tipo-risco')
router.register(r'areas-risco', AreaRiscoViewSet, basename='area-risco')
router.register(r'areas-seguras', AreaSeguraViewSet, basename='area-segura')
router.register(r'rotas-evacuacao', RotaEvacuacaoViewSet, basename='rota-evacuacao')

urlpatterns = [
    path('', include(router.urls)),
]