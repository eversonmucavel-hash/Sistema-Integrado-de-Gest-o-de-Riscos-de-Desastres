"""
SIGRD - URLs da app Displaced
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeslocadoViewSet

router = DefaultRouter()
router.register(r'deslocados', DeslocadoViewSet, basename='deslocado')

urlpatterns = [
    path('', include(router.urls)),
]