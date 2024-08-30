# eLMS/LMS/urls.py
from django.contrib import admin
from django.urls import path, include
from .views import CategoryListView, CourseListView, UserViewSet, CurrentUserViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register('categories', CategoryListView)
router.register('courses', CourseListView)
router.register('users', UserViewSet)
router.register('current-user', CurrentUserViewSet, basename='current-user')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
]
