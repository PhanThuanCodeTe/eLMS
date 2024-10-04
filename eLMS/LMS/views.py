# eLMS/LMS/views.py
import random
import json
import logging

logger = logging.getLogger(__name__)

from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.mail import send_mail
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, ListModelMixin
from .models import Category, Course, User, Module, CourseMembership, Test, Question, Answer, Notification, Forum, Post, \
    Reply, File, EssayAnswer, StudentAnswer, StudentScore, Passcode, TeacherRegister
from .serializers import CategorySerializer, CourseSerializer, UserSerializer, UserUpdateSerializer, \
    CourseCreateSerializer, CourseDetailSerializer, ModuleSerializer, ModuleTitleSerializer, TestSerializer, \
    AnswerSerializer, QuestionSerializer, NotificationSerializer, ForumSerializer, PostSerializer, ReplySerializer, \
    FileSerializer, EssayAnswerSerializer, StudentAnswerSerializer, StudentScoreSerializer, CourseMembershipSerializer, \
    TeacherRegisterSerializer
from django.db.models import Q


def home(request):
    return render(request, 'home.html')


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
            'date_of_birth': user.date_of_birth,
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
                'avatar': updated_user.get_avatar_url(),
                'date_of_birth': updated_user.date_of_birth
            }
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_passcode(user):
    # Check if user has already requested 3 passcodes today
    today = timezone.now().date()
    passcode_requests_today = Passcode.objects.filter(user=user, created_at__date=today).count()

    if passcode_requests_today >= 3:
        raise ValueError("You have reached the maximum number of passcodes for today.")

    # Generate 6-digit passcode
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

    # Create and save passcode
    passcode = Passcode.objects.create(user=user, code=code)

    # Send email to user with the passcode
    send_mail(
        'Your Password Reset Code',
        f'Your password reset code is: {code}. It will expire in 5 minutes.',
        'thuanpmt0711@gmail.com',
        [user.email],
    )

    return passcode


class PasswordResetViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'])
    def request_passcode(self, request):
        email = request.data.get('email')  # Get the email from request data

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip().lower()  # Ensure email is stripped and lowercase
        try:
            user = User.objects.get(email__iexact=email)  # Case-insensitive query
            generate_passcode(user)  # Call your passcode generation function
            return Response({'message': 'Passcode sent to your email.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not code or not new_password:
            return Response({'error': 'Passcode and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Find the passcode entry based on the code
            passcode = Passcode.objects.get(code=code)

            # Check if the passcode is expired
            if passcode.is_expired():
                return Response({'error': 'Passcode has expired.'}, status=status.HTTP_400_BAD_REQUEST)

            # Find the user associated with the passcode
            user = passcode.user

            # Reset the user's password
            user.set_password(new_password)
            user.save()

            # Optionally delete the used passcode
            passcode.delete()

            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)

        except Passcode.DoesNotExist:
            return Response({'error': 'Invalid passcode.'}, status=status.HTTP_400_BAD_REQUEST)


class CourseListView(viewsets.GenericViewSet, ListModelMixin):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Course.objects.all()
        user = self.request.user

        # Filter by authenticated teacher
        if user.is_authenticated and user.role == 1:  # Teacher
            queryset = queryset.filter(author=user)

        # Filtering by a single keyword across title, description, category, and author name
        keyword = self.request.query_params.get('q', None)
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) |
                Q(description__icontains=keyword) |
                Q(categories__name__icontains=keyword) |
                Q(author__first_name__icontains=keyword) |
                Q(author__last_name__icontains=keyword)
            ).distinct()

        # Sort by created_at descending to get the latest courses
        sort_by = self.request.query_params.get('sort', None)
        if sort_by == 'latest':
            queryset = queryset.order_by('-created_at')  # Sort by latest created

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        response_data = {
            'q': request.query_params.get('q', None),
            'courses': serializer.data,
        }

        return Response(response_data)


class CourseCreateView(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != 1:  # Check if the user is a Teacher
            return Response({"error": "Only teachers can create courses."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        course = serializer.save()

        # Use CourseDetailSerializer to return all course information
        detail_serializer = CourseDetailSerializer(course)

        # Add the teacher as a member of the course
        if request.user.is_authenticated:
            CourseMembership.objects.get_or_create(
                user=request.user,
                course=course,
                defaults={'attend_date': timezone.now(), 'is_active': True}
            )

        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class CourseDetailView(viewsets.ViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]  # Anyone can view, only authenticated can patch/delete

    def retrieve(self, request, pk=None):
        """Handle GET request to retrieve course details by ID."""
        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseDetailSerializer(course)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        """Handle PATCH request to update the course if the user is the teacher."""
        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only allow teachers (author of the course) to patch the course
        if request.user != course.author or request.user.role != 1:  # 1 is the teacher role
            raise PermissionDenied("You do not have permission to edit this course.")

        serializer = CourseCreateSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Handle DELETE request by marking the course as inactive (soft delete)."""
        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only allow teachers (author of the course) to delete (mark as inactive)
        if request.user != course.author or request.user.role != 1:  # 1 is the teacher role
            raise PermissionDenied("You do not have permission to delete this course.")

        # Soft delete: set is_active to False
        course.is_active = False
        course.save()

        return Response({"message": "Course has been deactivated."}, status=status.HTTP_204_NO_CONTENT)


class CategoryListView(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Category.objects.all()
        letter = self.request.query_params.get('letter', '').upper()

        if letter:
            queryset = queryset.filter(name__istartswith=letter)

        return queryset


class ModuleViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleTitleSerializer
        return ModuleSerializer

    def get_queryset(self):
        return Module.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        course = Course.objects.get(id=self.kwargs['course_id'])
        if self.request.user != course.author:
            raise PermissionDenied("You do not have permission to create modules for this course.")
        serializer.save(course=course)

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.course.author:
            raise PermissionDenied("You do not have permission to update this module.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.course.author:
            raise PermissionDenied("You do not have permission to delete this module.")
        instance.delete()


class UserCourseMembershipView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Ensure only authenticated users can access

    def list(self, request):
        # Fetch courses where the current user is a member
        memberships = CourseMembership.objects.filter(user=request.user, is_active=True)
        courses = [membership.course for membership in memberships]

        # Use CourseSerializer to return course details
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseMembershipViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='join')
    def join_course(self, request):
        user = request.user
        course_id = request.data.get('course_id')

        if not course_id:
            return Response({"error": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is already a member of the course
        membership, created = CourseMembership.objects.get_or_create(
            user=user,
            course=course,
            defaults={'attend_date': timezone.now(), 'is_active': True}
        )

        if not created:
            # If the membership exists, set is_active to True
            membership.is_active = True
            membership.save()
            return Response({"message": "Successfully rejoined the course."}, status=status.HTTP_200_OK)

        return Response({"message": "Successfully joined the course."}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='leave')
    def leave_course(self, request):
        user = request.user
        course_id = request.data.get('course_id')

        if not course_id:
            return Response({"error": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            membership = CourseMembership.objects.get(user=user, course=course)
            membership.is_active = False
            membership.save()
            return Response({"message": "Successfully left the course."}, status=status.HTTP_200_OK)
        except CourseMembership.DoesNotExist:
            return Response({"error": "You are not a member of this course."}, status=status.HTTP_404_NOT_FOUND)

    # Retrieve the membership details for a specific course
    def retrieve(self, request, pk=None):
        user = request.user
        try:
            membership = CourseMembership.objects.get(user=user, course__id=pk)
        except CourseMembership.DoesNotExist:
            return Response({"error": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the membership object and return the response
        serializer = CourseMembershipSerializer(membership)
        return Response(serializer.data)


class IsCourseAuthor(permissions.BasePermission):
    """
    Custom permission to allow only the author of the course to perform certain actions.
    """
    def has_permission(self, request, view):
        # Only allow authenticated users
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the user is the author of the course
        return obj.module.course.author == request.user


class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the tests for a module
        that the authenticated user has permissions to view.
        """
        user = self.request.user
        module_id = self.kwargs.get('module_id')
        module = get_object_or_404(Module, id=module_id)
        course = module.course

        # Check if the user is the author or a member of the course
        if course.author == user or CourseMembership.objects.filter(user=user, course=course, is_active=True).exists():
            return Test.objects.filter(module=module)
        else:
            return Test.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Only the course author can create tests.
        """
        module_id = request.data.get('module')
        module = get_object_or_404(Module, id=module_id)
        course = module.course

        # Check if the user is the author
        if request.user != course.author:
            return Response({"error": "Only the course author can create tests."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Only the course author can update tests.
        """
        test = self.get_object()
        if request.user != test.module.course.author:
            return Response({"error": "Only the course author can update tests."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Only the course author can delete tests.
        """
        test = self.get_object()
        if request.user != test.module.course.author:
            return Response({"error": "Only the course author can delete tests."}, status=status.HTTP_403_FORBIDDEN)

        # Perform the deletion
        self.perform_destroy(test)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        """
        Custom deletion to remove all relationships with the test.
        """
        instance.delete()


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        test_id = self.kwargs['test_id']
        return Question.objects.filter(test_id=test_id)

    def create(self, request, *args, **kwargs):
        test_id = self.kwargs['test_id']

        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response({"error": "Test not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()  # Make a copy of the data to modify it
        data['test'] = test.id  # Inject the test ID into the data

        # Convert type to integer and validate
        question_type = int(data.get('type'))
        if (test.test_type == 0 and question_type != 0) or (test.test_type == 1 and question_type != 1):
            raise ValidationError("Cannot add essay questions to a multiple-choice test or vice versa.")

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        # Ensure only the course author can update questions
        if question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can update questions.")

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        question = self.get_object()
        # Ensure only the course author can delete questions
        if question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can delete questions.")

        # Delete related answers
        question.answers.all().delete()
        return super().destroy(request, *args, **kwargs)


class AnswerViewSet(viewsets.ModelViewSet):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs['question_id']
        question = Question.objects.get(id=question_id)

        if question.test.module.course.author == self.request.user or CourseMembership.objects.filter(
                user=self.request.user, course=question.test.module.course, is_active=True).exists():
            return Answer.objects.filter(question=question)

        raise PermissionDenied("You do not have permission to access these answers.")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Pass the request context to the serializer
        serializer = self.get_serializer(queryset, many=True, context={'request': request})

        result = self.calculate_result(queryset)

        response_data = {
            "answers": serializer.data,
            "result": result
        }

        return Response(response_data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Pass the request context to the serializer
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def calculate_result(self, answers):
        correct_count = sum(1 for answer in answers if answer.is_correct)

        if correct_count == 1:
            return 1
        elif correct_count > 1:
            return 2
        else:
            return 0

    def create(self, request, *args, **kwargs):
        question_id = kwargs['question_id']
        question = Question.objects.get(id=question_id)

        if question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can create answers.")

        if question.type == 1:  # Essay question type
            raise ValidationError("Cannot add answers to an essay question.")

        # Use the serializer to validate and create the answer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = self.perform_create(serializer)

        response_data = {
            "id": instance.id,
            "choice": instance.choice,
            "is_correct": instance.is_correct,
        }

        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        instance = serializer.save(question_id=self.kwargs['question_id'])
        print(f"Created instance: {instance}")  # Print the instance
        return instance

    def update(self, request, *args, **kwargs):
        # Get the answer instance that needs to be updated
        answer = self.get_object()

        # Ensure only the course author can update answers
        if answer.question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can update answers.")

        # Proceed with updating the answer
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Get the answer instance that needs to be deleted
        answer = self.get_object()

        # Ensure only the course author can delete answers
        if answer.question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can delete answers.")

        # Proceed with deleting the answer
        return super().destroy(request, *args, **kwargs)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the last 10 notifications for the logged-in user, ordered by descending ID
        return Notification.objects.filter(user=self.request.user).order_by('-id')[:10]

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()

        # Ensure only the owner can update their notification
        if notification.user != request.user:
            raise PermissionDenied("You do not have permission to modify this notification.")

        # Prevent updates if the notification is already marked as read
        if notification.is_read:
            raise ValidationError("This notification is already marked as read and cannot be modified.")

        # Only allow marking the notification as read
        if 'is_read' in request.data and request.data['is_read'] is True:
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid update request."}, status=status.HTTP_400_BAD_REQUEST)


class ForumViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, course_id=None):
        """
        Retrieve the forum information for a specific course.
        """
        try:
            # Get the course object by course_id
            course = Course.objects.get(id=course_id)

            # Ensure the user is the course author or a course member
            if course.author != request.user and not CourseMembership.objects.filter(
                user=request.user, course=course, is_active=True
            ).exists():
                raise PermissionDenied("You do not have permission to access this forum.")

            # Get the related forum for the course
            forum = Forum.objects.get(course=course)
            serializer = ForumSerializer(forum)
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=404)
        except Forum.DoesNotExist:
            return Response({"error": "Forum not found for the course."}, status=404)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        forum_id = self.kwargs.get('forum_id')
        forum = Forum.objects.get(id=forum_id)

        # Ensure the user is a course member or the course author
        if forum.course.author == self.request.user or CourseMembership.objects.filter(
                user=self.request.user, course=forum.course, is_active=True
        ).exists():
            return Post.objects.filter(forum=forum)
        raise PermissionDenied("You do not have permission to access these posts.")

    def perform_create(self, serializer):
        forum_id = self.kwargs.get('forum_id')
        forum = Forum.objects.get(id=forum_id)

        # Ensure the user is a course member or the course author
        if forum.course.author != self.request.user and not CourseMembership.objects.filter(
                user=self.request.user, course=forum.course, is_active=True
        ).exists():
            raise PermissionDenied("You do not have permission to create a post in this forum.")

        serializer.save(user=self.request.user, forum=forum)

    def destroy(self, request, *args, **kwargs):
        # Prevent deletion of posts by any user
        raise PermissionDenied("You do not have permission to delete posts.")


class ReplyViewSet(viewsets.ModelViewSet):
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        post = Post.objects.get(id=post_id)

        # Ensure the user is a course member or the course author
        if post.forum.course.author == self.request.user or CourseMembership.objects.filter(
                user=self.request.user, course=post.forum.course, is_active=True
        ).exists():
            return Reply.objects.filter(question=post)
        raise PermissionDenied("You do not have permission to access these replies.")

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = Post.objects.get(id=post_id)

        # Ensure the user is a course member or the course author
        if post.forum.course.author != self.request.user and not CourseMembership.objects.filter(
                user=self.request.user, course=post.forum.course, is_active=True
        ).exists():
            raise PermissionDenied("You do not have permission to reply to this post.")

        serializer.save(user=self.request.user, question=post)

    def destroy(self, request, *args, **kwargs):
        # Prevent deletion of replies by any user
        raise PermissionDenied("You do not have permission to delete replies.")


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        module = Module.objects.get(id=module_id)

        # Ensure the user is a course member to view files
        if CourseMembership.objects.filter(user=self.request.user, course=module.course, is_active=True).exists():
            return File.objects.filter(module=module)
        raise PermissionDenied("You do not have permission to access these files.")

    def perform_create(self, serializer):
        module_id = self.kwargs.get('module_id')
        module = Module.objects.get(id=module_id)

        # Ensure the user is the course author to add files
        if module.course.author != self.request.user:
            raise PermissionDenied("You do not have permission to add files to this module.")

        # Check for file or file_url and set file_type accordingly
        file_data = self.request.data.get('file')
        file_url_data = self.request.data.get('file_url')

        if file_data:
            # If a file is provided, set file_type to 'Tập tin'
            serializer.save(module=module, file_type='Tập tin')
        elif file_url_data:
            # If a file URL is provided, set file_type to 'Liên kết'
            serializer.save(module=module, file_type='Liên kết')
        else:
            raise ValidationError("You must provide either a file or a file URL.")

    def destroy(self, request, *args, **kwargs):
        file = self.get_object()
        module = file.module

        # Ensure the user is the course author to delete files
        if module.course.author != self.request.user:
            raise PermissionDenied("You do not have permission to delete this file.")

        return super().destroy(request, *args, **kwargs)


class EssayAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = EssayAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Fetch the question ID from the request data
        question_id = request.data.get('question')

        # Ensure the question ID exists in the request
        if not question_id:
            return Response({"error": "Question ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the question or return a 404 error
        question = get_object_or_404(Question, id=question_id)

        # Check if the user has already submitted an essay answer
        existing_answer = EssayAnswer.objects.filter(user=request.user, question=question).first()
        if existing_answer:
            # Return the existing answer with a 200 OK status instead of 400 Bad Request
            serializer = self.get_serializer(existing_answer)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Ensure the user is a course member
        if not CourseMembership.objects.filter(user=self.request.user, course=question.test.module.course,
                                               is_active=True).exists():
            raise PermissionDenied("You do not have permission to answer this question.")

        # Save the essay answer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, question=question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def get_essay_answer(self, request, question_id=None):
        question = get_object_or_404(Question, id=question_id)
        essay_answer = EssayAnswer.objects.filter(user=request.user, question=question).first()

        if essay_answer:
            serializer = self.get_serializer(essay_answer)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "No essay answer found."}, status=status.HTTP_404_NOT_FOUND)

    def get_queryset(self):
        user = self.request.user
        if user.role == 1:  # Assuming 1 is the role code for teachers
            # Teachers can see all answers
            return EssayAnswer.objects.all()
        else:
            # Students can only see their own answers
            return EssayAnswer.objects.filter(user=user)

    @action(detail=False, methods=['get'], url_path='get-student-answer')
    def get_student_answer(self, request):
        question_id = request.query_params.get('question_id')
        if not question_id:
            return Response({"error": "Question ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        question = get_object_or_404(Question, id=question_id)

        if request.user.role == 1:  # Teacher
            # Fetch all student answers for this question
            answers = EssayAnswer.objects.filter(question=question)
            serializer = self.get_serializer(answers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:  # Student
            # Fetch the student's own answer
            answer = EssayAnswer.objects.filter(user=request.user, question=question).first()
            if answer:
                serializer = self.get_serializer(answer)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "You haven't submitted an answer for this question yet."},
                                status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], url_path='update-score')
    def update_score(self, request, pk=None):
        essay_answer = self.get_object()

        # Check if the user is a teacher and has permission
        if request.user.role != 1 or essay_answer.question.test.module.course.author.id != request.user.id:
            return Response({"error": "You do not have permission to update this score."},
                            status=status.HTTP_403_FORBIDDEN)

        # Update score and comments
        serializer = self.get_serializer(essay_answer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        question_id = request.data.get('question')
        question = get_object_or_404(Question, id=question_id)

        selected_answers_str = request.data.get('selected_answer')

        if selected_answers_str is None:
            return Response({"error": "selected_answer is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            selected_answers = json.loads(selected_answers_str)
            if not isinstance(selected_answers, list):
                raise ValueError("selected_answer must be a list.")
        except (ValueError, json.JSONDecodeError):
            return Response({"error": "Invalid format for selected_answer."}, status=status.HTTP_400_BAD_REQUEST)

        # Clear old answers for this question
        StudentAnswer.objects.filter(user=request.user, question=question).delete()

        created_answers = []
        for answer_id in selected_answers:
            data = {
                'user': request.user.id,
                'question': question.id,
                'selected_answer': answer_id,
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            created_answer = serializer.save(question=question)
            created_answers.append(created_answer)

        # Update the overall score
        self.update_student_score(question.test)

        response_data = {
            'count': len(created_answers),
            'answers': [StudentAnswerSerializer(answer).data for answer in created_answers],
        }

        correct_answers_count = Answer.objects.filter(question=question, is_correct=True).count()
        if len(selected_answers) > correct_answers_count:
            response_data['warning'] = 'You submitted too many answers, score for this question is 0%.'

        return Response(response_data, status=status.HTTP_201_CREATED)

    def calculate_question_score(self, question, selected_answers, total_questions):
        correct_answers = Answer.objects.filter(question=question, is_correct=True)
        correct_answers_count = correct_answers.count()
        selected_correct_answers_count = correct_answers.filter(id__in=selected_answers).count()

        # If more answers are submitted than there are correct answers, score is 0
        if len(selected_answers) > correct_answers_count:
            return 0

        # Calculate the score based on the proportion of correct answers selected
        if correct_answers_count > 0:
            score = (selected_correct_answers_count / correct_answers_count) * (100 / total_questions)
        else:
            score = 0

        return score

    def update_student_score(self, test):
        student_answers = StudentAnswer.objects.filter(user=self.request.user, question__test=test)
        total_questions = test.questions.count()
        total_score = 0

        for question in test.questions.all():
            selected_answers = student_answers.filter(question=question).values_list('selected_answer', flat=True)
            question_score = self.calculate_question_score(question, selected_answers, total_questions)
            total_score += question_score

        # Update or create the score record
        score_record, _ = StudentScore.objects.get_or_create(user=self.request.user, test=test)
        score_record.score = total_score
        score_record.save()


class StudentScoreViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, test_id=None):
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response({"error": "Test not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is the course author
        if test.module.course.author == request.user:
            # Author can view all students' scores for the test
            scores = StudentScore.objects.filter(test=test)
            serializer = StudentScoreSerializer(scores, many=True)
            return Response(serializer.data)

        # Check if the user is a course member (student)
        elif CourseMembership.objects.filter(user=request.user, course=test.module.course, is_active=True).exists():
            # Students can only view their own score
            try:
                student_score = StudentScore.objects.get(user=request.user, test=test)
            except StudentScore.DoesNotExist:
                return Response({"error": "No score found for this test."}, status=status.HTTP_404_NOT_FOUND)

            serializer = StudentScoreSerializer(student_score)
            return Response(serializer.data)

        else:
            raise PermissionDenied("You do not have permission to view these scores.")


class TeacherRegisterViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherRegisterSerializer

    def create(self, request):
        user = request.user
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check if the user already applied
            if TeacherRegister.objects.filter(user=user).exists():
                return Response({'detail': 'You have already submitted a registration request.'},
                              status=status.HTTP_400_BAD_REQUEST)

            # Save the registration
            serializer.save(user=user)
            return Response({'detail': 'Teacher registration submitted successfully.'},
                          status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

