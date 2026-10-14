"""
SIGRD - URLs da app Shelters
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaInfraestruturaViewSet, InfraestruturaViewSet, AbrigoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaInfraestruturaViewSet, basename='categoria')
router.register(r'infraestruturas', InfraestruturaViewSet, basename='infraestrutura')
router.register(r'abrigos', AbrigoViewSet, basename='abrigo')

urlpatterns = [
    path('', include(router.urls)),
]