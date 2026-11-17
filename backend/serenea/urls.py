from django.contrib import admin
from django.urls import include, path

from inquiries.views import metrics_dashboard

urlpatterns = [
    path("admin/metrics/", admin.site.admin_view(metrics_dashboard), name="site_metrics"),
    path("admin/", admin.site.urls),
    path("api/", include("inquiries.urls")),
]
