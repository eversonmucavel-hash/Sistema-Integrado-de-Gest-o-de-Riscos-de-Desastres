"""
SIGRD - URLs da app Geography
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProvinciaViewSet, DistritoViewSet

router = DefaultRouter()
router.register(r'provincias', ProvinciaViewSet, basename='provincia')
router.register(r'distritos', DistritoViewSet, basename='distrito')

urlpatterns = [
    path('', include(router.urls)),
]