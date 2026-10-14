"""
SIGRD - URLs da app Alerts
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertaViewSet, AlertaEnviadoViewSet

router = DefaultRouter()
router.register(r'alertas', AlertaViewSet, basename='alerta')
router.register(r'envios', AlertaEnviadoViewSet, basename='envio')

urlpatterns = [
    path('', include(router.urls)),
]