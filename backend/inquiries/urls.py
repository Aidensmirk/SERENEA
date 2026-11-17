from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("analytics/", views.analytics, name="analytics"),
    path("contact/", views.contact, name="contact"),
]
