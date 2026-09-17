from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

# Initialize the DRF router and register the StudentViewSet
router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    # Exposes:
    # - GET /api/students/
    # - POST /api/students/
    # - GET /api/students/<id>/
    # - PUT /api/students/<id>/
    # - PATCH /api/students/<id>/
    # - DELETE /api/students/<id>/
    path('', include(router.urls)),
]
