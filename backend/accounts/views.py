"""
SIGRD - Views da app Accounts
"""
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import User, Profile
from .serializers import (
    UserSerializer, UserListSerializer, UserCreateSerializer,
    ProfileSerializer, ChangePasswordSerializer, MeSerializer,
)


class RegisterView(APIView):
    """Registo publico de novos utilizadores"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'mensagem': 'Utilizador criado com sucesso.',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Perfil do utilizador autenticado (GET/PUT/PATCH)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = MeSerializer(request.user, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Alterar password do utilizador autenticado"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'mensagem': 'Password alterada com sucesso.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileViewSet(viewsets.ModelViewSet):
    """API de Perfis de acesso"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'codigo']
    ordering = ['-nivel_acesso']


class UserViewSet(viewsets.ModelViewSet):
    """
    API de Utilizadores
    - Requer autenticacao
    - Filtros: ?perfil=1&is_active=true&provincia=5
    - Acoes: /me/, /ativar/{id}/, /desativar/{id}/, /estatisticas/
    """
    queryset = User.objects.select_related('perfil', 'provincia', 'distrito').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome_completo', 'email', 'telefone', 'instituicao']
    ordering_fields = ['nome_completo', 'created_at', 'ultimo_login']
    ordering = ['nome_completo']
    filterset_fields = ['perfil', 'is_active', 'is_staff', 'verificado', 'provincia', 'distrito']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        """Apenas admins podem criar/apagar utilizadores"""
        if self.action in ['create', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def ativar(self, request, pk=None):
        """Ativar um utilizador"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'mensagem': f'Utilizador {user.email} ativado.'})

    @action(detail=True, methods=['post'])
    def desativar(self, request, pk=None):
        """Desativar um utilizador"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'mensagem': f'Utilizador {user.email} desativado.'})

    @action(detail=True, methods=['post'])
    def verificar(self, request, pk=None):
        """Marcar utilizador como verificado"""
        user = self.get_object()
        user.verificado = True
        user.save()
        return Response({'mensagem': f'Utilizador {user.email} verificado.'})

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Estatisticas de utilizadores"""
        qs = self.get_queryset()
        total = qs.count()
        ativos = qs.filter(is_active=True).count()
        verificados = qs.filter(verificado=True).count()

        por_perfil = list(
            qs.values('perfil__codigo', 'perfil__nome')
            .annotate(total=__import__('django').db.models.Count('id'))
            .order_by('-total')
        )

        return Response({
            'total_utilizadores': total,
            'ativos': ativos,
            'inativos': total - ativos,
            'verificados': verificados,
            'por_perfil': por_perfil,
        })