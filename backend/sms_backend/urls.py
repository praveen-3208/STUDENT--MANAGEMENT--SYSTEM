"""
URL configuration for sms_backend project.

The `urlpatterns` list routes URLs to views.
Including students app API routes under `/api/`.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Include student API endpoints: /api/students/
    path('api/', include('students.urls')),
    path('api/auth/', include('accounts.urls')),
]
