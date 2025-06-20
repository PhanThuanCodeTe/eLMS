# eLMS/eLMS/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
                  path('admin-site/', admin.site.urls),
                  path('', include('LMS.urls')),
                  path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
