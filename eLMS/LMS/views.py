# eLMS/LMS/views.py
import random

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
    Reply, File, EssayAnswer, StudentAnswer, StudentScore, Passcode
from .serializers import CategorySerializer, CourseSerializer, UserSerializer, UserUpdateSerializer, \
    CourseCreateSerializer, CourseDetailSerializer, ModuleSerializer, ModuleTitleSerializer, TestSerializer, \
    AnswerSerializer, QuestionSerializer, NotificationSerializer, ForumSerializer, PostSerializer, ReplySerializer, \
    FileSerializer, EssayAnswerSerializer, StudentAnswerSerializer, StudentScoreSerializer
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
        user = self.request.user
        if user.is_authenticated and user.role == 1:  # Teacher
            return Course.objects.filter(author=user)
        else:
            return Course.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        response_data = {
            'courses': serializer.data,
            'user_role': 'teacher' if request.user.is_authenticated and request.user.role == 1 else 'student_or_anonymous'
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
        # Get the question ID from the URL parameters
        question_id = self.kwargs['question_id']
        question = Question.objects.get(id=question_id)

        # Ensure the user is a course member or the course author
        if question.test.module.course.author == self.request.user or CourseMembership.objects.filter(
                user=self.request.user, course=question.test.module.course, is_active=True).exists():
            return Answer.objects.filter(question=question)

        raise PermissionDenied("You do not have permission to access these answers.")

    def create(self, request, *args, **kwargs):
        # Get the question instance based on the URL parameter
        question_id = kwargs['question_id']
        question = Question.objects.get(id=question_id)

        # Ensure only the course author can create answers
        if question.test.module.course.author != request.user:
            raise PermissionDenied("Only the course author can create answers.")

        # Validate that answers are not added to an essay question
        if question.type == 1:  # Essay question type
            raise ValidationError("Cannot add answers to an essay question.")

        # Serialize the answer data and assign the question automatically
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(question=question)  # Automatically set the question

        return Response(serializer.data, status=status.HTTP_201_CREATED)

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

    def get_queryset(self):
        question_id = self.kwargs.get('question_id')
        question = Question.objects.get(id=question_id)

        # Ensure only the creator or course author can access the answers
        if question.test.module.course.author == self.request.user or self.request.user == question.essayanswer.user:
            return EssayAnswer.objects.filter(question=question)
        raise PermissionDenied("You do not have permission to view this answer.")

    def perform_create(self, serializer):
        question = Question.objects.get(id=self.kwargs.get('question_id'))

        # Ensure the user is a course member
        if not CourseMembership.objects.filter(user=self.request.user, course=question.test.module.course,
                                               is_active=True).exists():
            raise PermissionDenied("You do not have permission to answer this question.")

        # Ensure students can't set the score or teacher's comments
        serializer.save(user=self.request.user, question=question)

    def update(self, request, *args, **kwargs):
        essay_answer = self.get_object()

        # Ensure only the teacher can update the score or comments
        if request.user != essay_answer.question.test.module.course.author:
            raise PermissionDenied("Only the course author can update the score or comments.")

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Disable PATCH method
        raise PermissionDenied("PATCH method is not allowed.")

    def destroy(self, request, *args, **kwargs):
        # Disable DELETE method
        raise PermissionDenied("DELETE method is not allowed.")


class StudentAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs.get('question_id')
        question = Question.objects.get(id=question_id)

        # Ensure only the creator or course author can access the answers
        if question.test.module.course.author == self.request.user or self.request.user == question.studentanswer.user:
            return StudentAnswer.objects.filter(question=question)
        raise PermissionDenied("You do not have permission to view this answer.")

    def create(self, request, *args, **kwargs):
        # Get the question instance based on the URL parameter
        question_id = request.data.get('question')
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure only course members can submit an answer
        if not (request.user == question.test.module.course.author or
                CourseMembership.objects.filter(user=request.user, course=question.test.module.course, is_active=True).exists()):
            raise PermissionDenied("You do not have permission to answer this question.")

        # Assign the authenticated user to the answer
        data = request.data.copy()
        data['user'] = request.user.id  # Automatically assign the user

        # Serialize the answer data and assign the question
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(question=question)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Disable the update of `is_correct` (handled automatically)
        raise PermissionDenied("You cannot modify the answer once it has been submitted.")

    def partial_update(self, request, *args, **kwargs):
        # Disable PATCH method
        raise PermissionDenied("PATCH method is not allowed.")

    def destroy(self, request, *args, **kwargs):
        # Disable DELETE method
        raise PermissionDenied("DELETE method is not allowed.")


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
