from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError as DRFValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet providing complete CRUD operations for Student records:
    - GET    /api/students/          -> List all students (optional ?search=, ?course=, ?status=)
    - POST   /api/students/          -> Create a new student (validates fields & email uniqueness)
    - GET    /api/students/<id>/     -> Retrieve single student by ID
    - PUT    /api/students/<id>/     -> Update all student attributes
    - PATCH  /api/students/<id>/     -> Partially update student attributes
    - DELETE /api/students/<id>/     -> Delete student record

    Exception Handling:
    - Returns HTTP 400 Bad Request with readable error messages for invalid input.
    - Returns HTTP 404 Not Found with clear explanatory details when a student ID does not exist.
    """

    queryset = Student.objects.all().order_by('-id')
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter students by search term, course, or status.
        Supports case-insensitive search across name, email, and course.
        """
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('search', '').strip()
        course_filter = self.request.query_params.get('course', '').strip()
        status_filter = self.request.query_params.get('status', '').strip()

        if search_query:
            queryset = queryset.filter(
                models_q := (
                    queryset.model.objects.filter(name__icontains=search_query) |
                    queryset.model.objects.filter(email__icontains=search_query) |
                    queryset.model.objects.filter(course__icontains=search_query)
                )
            ).distinct()

        if course_filter:
            queryset = queryset.filter(course__iexact=course_filter)

        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)

        return queryset

    def get_object(self):
        """
        Retrieve single student record with explicit 404 handling.
        Returns a friendly error message when the requested ID is not found.
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        pk = self.kwargs.get(lookup_url_kwarg)

        try:
            return super().get_object()
        except (Http404, NotFound):
            raise NotFound(
                detail={
                    "error": "Student Not Found",
                    "detail": f"Student with ID '{pk}' does not exist.",
                    "status_code": 404
                }
            )
        except (ValueError, TypeError):
            raise DRFValidationError(
                detail={
                    "error": "Invalid ID",
                    "detail": f"The provided student ID '{pk}' is invalid.",
                    "status_code": 400
                }
            )

    def create(self, request, *args, **kwargs):
        """
        Create a new student record.
        Validates request data against StudentSerializer rules.
        Returns 201 Created on success or 400 Bad Request with field-level errors.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation Error",
                    "message": "Please correct the errors below.",
                    "errors": serializer.errors,
                    "status_code": 400
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "message": "Student created successfully.",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """
        Update an existing student record (PUT / PATCH).
        Ensures email uniqueness across other records and validates all fields.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation Error",
                    "message": "Please correct the errors below.",
                    "errors": serializer.errors,
                    "status_code": 400
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_update(serializer)
        return Response(
            {
                "message": "Student updated successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a student record.
        Returns HTTP 200 with confirmation message (or standard 204).
        """
        instance = self.get_object()
        student_id = instance.id
        student_name = instance.name
        self.perform_destroy(instance)
        return Response(
            {
                "message": f"Student '{student_name}' (ID: {student_id}) was deleted successfully.",
                "id": student_id,
                "status_code": 200
            },
            status=status.HTTP_200_OK
        )
