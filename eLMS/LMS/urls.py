from django.contrib import admin
from django.urls import path, include

from .views import CategoryListView, CourseListView, UserViewSet, CurrentUserViewSet, CourseCreateView, ModuleViewSet, \
    CourseMembershipViewSet, TestViewSet, QuestionViewSet, AnswerViewSet, NotificationViewSet, ForumViewSet, \
    PostViewSet, ReplyViewSet, FileViewSet, EssayAnswerViewSet, StudentAnswerViewSet, StudentScoreViewSet, \
    PasswordResetViewSet, CourseDetailView, UserCourseMembershipView, TeacherRegisterViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register('categories', CategoryListView, basename='category')
router.register('courses', CourseListView, basename='course-list')
router.register('users', UserViewSet, basename='user')
router.register('current-user', CurrentUserViewSet, basename='current-user')
router.register('create-course', CourseCreateView, basename='create-course')
router.register(r'courses', CourseDetailView, basename='course-detail')
router.register(r'courses/(?P<course_id>\d+)/module', ModuleViewSet, basename='module')
router.register('course-membership', CourseMembershipViewSet, basename='course-membership')
router.register(r'modules/(?P<module_id>\d+)/tests', TestViewSet, basename='test')
router.register(r'tests/(?P<test_id>\d+)/questions', QuestionViewSet, basename='questions')
router.register(r'questions/(?P<question_id>\d+)/answers', AnswerViewSet, basename='answers')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'courses/(?P<course_id>\d+)/forum', ForumViewSet, basename='forum')
router.register(r'forums/(?P<forum_id>\d+)/posts', PostViewSet, basename='posts')
router.register(r'posts/(?P<post_id>\d+)/replies', ReplyViewSet, basename='replies')
router.register(r'modules/(?P<module_id>\d+)/files', FileViewSet, basename='module-files')
router.register(r'essay_answers', EssayAnswerViewSet, basename='essayanswer')
router.register(r'student_answers', StudentAnswerViewSet, basename='studentanswer')
router.register(r'tests/(?P<test_id>\d+)/scores', StudentScoreViewSet, basename='student-score')
router.register(r'password-reset', PasswordResetViewSet, basename='password-reset')
router.register(r'user-membership-courses', UserCourseMembershipView, basename='user-membership-courses')
router.register('teacher-register', TeacherRegisterViewSet, basename='teacher-register')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    ]