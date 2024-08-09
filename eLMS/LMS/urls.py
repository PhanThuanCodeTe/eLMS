# eLMS/urls.py

from django.contrib import admin
from django.urls import path

from eLMS.LMS import views

# router = routers.DefaultRouter()
# router.register('LMS', views.CategoryViewset)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, 'home'),  # URL cho trang chính
]
