# eLMS/LMS/serializers.py
from rest_framework import serializers
from .models import Category, Course
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['title', 'cover_image_url', 'description', 'is_active']

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None


User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.FileField(required=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'gender', 'avatar', 'first_name', 'last_name']

    def validate_avatar(self, value):
        if not value:
            raise serializers.ValidationError("Avatar is required.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        gender = validated_data['gender']
        avatar = validated_data['avatar']
        first_name = validated_data['first_name']
        last_name = validated_data['last_name']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            gender=gender,
            avatar=avatar,
            first_name=first_name,
            last_name=last_name
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.FileField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar']

    def update(self, instance, validated_data):
        if 'email' in validated_data:
            instance.username = validated_data['email']
        return super().update(instance, validated_data)