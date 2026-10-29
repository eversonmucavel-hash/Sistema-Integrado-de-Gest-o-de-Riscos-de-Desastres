"""
SIGRD - URLs da app Citizens
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PessoaRegistadaViewSet, RegistoPublicoView

router = DefaultRouter()
router.register(r'pessoas', PessoaRegistadaViewSet, basename='pessoa')

urlpatterns = [
    # Registo público (sem autenticação)
    path('registar/', RegistoPublicoView.as_view(), name='registo-publico'),

    # ViewSet
    path('', include(router.urls)),
]