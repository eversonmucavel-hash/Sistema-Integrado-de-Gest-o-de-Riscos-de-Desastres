"""
SIGRD - URLs da app Incidents
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventoDesastreViewSet

router = DefaultRouter()
router.register(r'eventos', EventoDesastreViewSet, basename='evento')

urlpatterns = [
    path('', include(router.urls)),
]