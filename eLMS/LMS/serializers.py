# eLMS/LMS/serializers.py
import ast

from rest_framework import serializers
from .models import Category, Course, Module, CourseMembership, Test, Question, Answer, Notification, Forum, Post, \
    Reply, File, EssayAnswer, StudentAnswer, StudentScore
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.timesince import timesince
from django.utils import timezone

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.FileField(required=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(
        format="%d/%m/%Y",
        input_formats=['%d/%m/%Y', '%Y-%m-%d'],
        required=False
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'gender', 'avatar', 'first_name', 'last_name', 'date_of_birth']

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
        date_of_birth = validated_data['date_of_birth']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            gender=gender,
            avatar=avatar,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.FileField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    date_of_birth = serializers.DateField(required=False)
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar', 'date_of_birth', 'old_password', 'new_password']

    def validate(self, data):
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if old_password and not new_password:
            raise serializers.ValidationError("New password is required when old password is provided.")
        if new_password and not old_password:
            raise serializers.ValidationError("Old password is required when providing a new password.")

        if old_password and new_password:
            user = self.instance
            if not user.check_password(old_password):
                raise serializers.ValidationError("Mật khẩu sai.")

        return data

    def update(self, instance, validated_data):
        if 'old_password' in validated_data and 'new_password' in validated_data:
            old_password = validated_data['old_password']
            new_password = validated_data['new_password']
            if old_password and new_password:
                instance.set_password(new_password)

        # Remove password fields from the data being saved to prevent them from being updated unintentionally
        validated_data.pop('old_password', None)
        validated_data.pop('new_password', None)

        return super().update(instance, validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    author = UserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'cover_image_url', 'description', 'created_at', 'is_active', 'categories', 'author']

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def get_created_at(self, obj):
        return timesince(obj.created_at, timezone.now()) + " ago"

    def get_categories(self, obj):
        return list(obj.categories.values_list('id', flat=True))


class CourseCreateSerializer(serializers.ModelSerializer):
    category = serializers.CharField(write_only=True)
    cover_image = serializers.ImageField(required=True)

    class Meta:
        model = Course
        fields = ['title', 'cover_image', 'description', 'category']

    def validate_category(self, value):
        try:
            category_ids = ast.literal_eval(value)
            if not isinstance(category_ids, list):
                raise serializers.ValidationError("Category must be a list of integers")
            return [int(cat_id) for cat_id in category_ids]
        except (ValueError, SyntaxError):
            raise serializers.ValidationError("Invalid format for category. Expected a list of integers")

    def create(self, validated_data):
        categories = validated_data.pop('category')
        course = Course.objects.create(**validated_data, author=self.context['request'].user)
        course.categories.set(Category.objects.filter(id__in=categories))
        return course


class CourseDetailSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'cover_image_url', 'description', 'created_at', 'is_active', 'categories', 'author']

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def get_created_at(self, obj):
        return timesince(obj.created_at, timezone.now()) + " ago"

    def get_categories(self, obj):
        return list(obj.categories.values_list('id', flat=True))

    def get_author(self, obj):
        if obj.author:
            return {
                'id': obj.author.id,
                'email': obj.author.email,
                'avatar_url': obj.author.get_avatar_url()
            }
        return "Admin"


class ModuleTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title']


# Serializer for creating, updating, and deleting modules (all attributes)
class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'youtube_url', 'description', 'created_at']
        read_only_fields = ['created_at']


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file_url', 'file', 'file_type']
        read_only_fields = ['file_type']

    def validate(self, data):
        if not data.get('file_url') and not data.get('file'):
            raise serializers.ValidationError("You must provide either a file or a file URL.")
        if data.get('file_url') and data.get('file'):
            raise serializers.ValidationError("You can only provide a file or a file URL, not both.")
        return data


class CourseMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMembership
        fields = ['user', 'course', 'attend_date', 'finish_date', 'progress', 'is_active']


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'test', 'content', 'type']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'choice', 'is_correct']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'created_at', 'is_read']
        read_only_fields = ['user', 'message', 'created_at']


class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id', 'course']


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'user', 'title', 'body', 'created_at']
        read_only_fields = ['user', 'created_at']


class ReplySerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Reply
        fields = ['id', 'user', 'user_full_name', 'body', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class EssayAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = EssayAnswer
        fields = ['id', 'question', 'user', 'answer_text', 'teacher_comments', 'score']
        read_only_fields = ['teacher_comments', 'score']  # These fields should only be set by the teacher

    def validate(self, data):
        # Ensure the user can't set the score
        if 'score' in data or 'teacher_comments' in data:
            if self.context['request'].user != data['question'].test.module.course.author:
                raise serializers.ValidationError("Only the course author can provide scores or comments.")
        return data


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'user', 'selected_answer', 'is_correct']
        read_only_fields = ['is_correct']  # This field should be calculated automatically

    def validate(self, data):
        # Ensure the question is a multiple-choice question
        if data['question'].type != 0:
            raise serializers.ValidationError("Cannot add answers to an essay question.")
        return data


class StudentScoreSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentScore
        fields = ['full_name', 'test', 'score', 'last_modified']

    def get_full_name(self, obj):
        # Trả về first_name + " " + last_name
        return f"{obj.user.first_name} {obj.user.last_name}"
