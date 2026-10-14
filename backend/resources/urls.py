"""
SIGRD - URLs da app Resources
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaRecursoViewSet, RecursoViewSet, DistribuicaoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaRecursoViewSet, basename='categoria')
router.register(r'recursos', RecursoViewSet, basename='recurso')
router.register(r'distribuicoes', DistribuicaoViewSet, basename='distribuicao')

urlpatterns = [
    path('', include(router.urls)),
]