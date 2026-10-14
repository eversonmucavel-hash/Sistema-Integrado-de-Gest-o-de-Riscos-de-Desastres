"""
SIGRD - URLs da app Accounts
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    UserViewSet, ProfileViewSet,
    RegisterView, MeView, ChangePasswordView,
)
from .serializers import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    # Autenticação JWT (com email)
    path('login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('verify/', TokenVerifyView.as_view(), name='auth-verify'),

    # Autenticação
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('change_password/', ChangePasswordView.as_view(), name='change-password'),

    # ViewSets
    path('', include(router.urls)),
]