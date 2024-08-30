# eLMS/LMS/views.py
from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin
from .models import Category, Course, User
from .serializers import CategorySerializer, CourseSerializer, UserSerializer, UserUpdateSerializer


def home(request):
    return render(request, 'home.html')


class CategoryListView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CourseListView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class UserViewSet(viewsets.GenericViewSet, CreateModelMixin):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Ensure this view is accessible without authentication

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'id': user.id,
                'email': user.email,
                'password': user.password,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'gender': user.gender,
                'role': user.role,
                'avatar': user.get_avatar_url(),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


class CurrentUserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer

    @action(detail=False, methods=['get'])
    def info(self, request):
        user = request.user
        data = {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'last_login': user.last_login,
            'gender': user.gender,
            'role': user.role,
            'avatar': user.get_avatar_url()
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'])
    def update_info(self, request):
        user = request.user
        serializer = self.serializer_class(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            updated_user = request.user
            data = {
                'email': updated_user.email,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name,
                'last_login': updated_user.last_login,
                'gender': updated_user.gender,
                'role': updated_user.role,
                'avatar': updated_user.get_avatar_url()
            }
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
