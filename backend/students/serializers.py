import re
from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Student model.

    Features:
    - Serializes all model attributes including auto-generated id & enrollment_date.
    - Field-level validation for email format and required fields.
    - Custom uniqueness validation for email on both create and update operations,
      returning clear, user-friendly error messages.
    """

    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'date_of_birth',
            'course',
            'enrollment_date',
            'status',
        ]
        read_only_fields = ['id', 'enrollment_date']
        extra_kwargs = {
            'name': {'required': True, 'error_messages': {'blank': 'Student name is required.'}},
            'email': {'required': True, 'error_messages': {'blank': 'Email address is required.'}},
            'phone': {'required': True, 'error_messages': {'blank': 'Phone number is required.'}},
            'date_of_birth': {'required': True, 'error_messages': {'blank': 'Date of birth is required.'}},
            'course': {'required': True, 'error_messages': {'blank': 'Course is required.'}},
            'status': {'required': False},
        }

    def validate_name(self, value):
        """Ensure name is not empty or just whitespace."""
        clean_name = value.strip()
        if not clean_name:
            raise serializers.ValidationError("Student name cannot be empty.")
        if len(clean_name) < 2:
            raise serializers.ValidationError("Student name must be at least 2 characters.")
        return clean_name

    def validate_email(self, value):
        """
        Field-level validation:
        1. Format verification using standard email regex.
        2. Uniqueness check for both creation and updates, rejecting duplicates
           with an explicit error message.
        """
        clean_email = value.strip().lower()
        if not clean_email:
            raise serializers.ValidationError("Email address is required.")

        # Standard email format check
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, clean_email):
            raise serializers.ValidationError("Please provide a valid email address (e.g. student@example.com).")

        # Check for duplicate email in database
        query = Student.objects.filter(email__iexact=clean_email)
        if self.instance:
            # When updating an existing student, exclude current record
            query = query.exclude(pk=self.instance.pk)

        if query.exists():
            raise serializers.ValidationError(
                f"A student with email '{clean_email}' already exists. Please use a unique email address."
            )

        return clean_email

    def validate_phone(self, value):
        """Validate phone number string."""
        clean_phone = value.strip()
        if not clean_phone:
            raise serializers.ValidationError("Phone number is required.")
        # Basic sanity check for phone characters: digits, spaces, hyphens, parentheses, plus
        if not re.match(r'^[0-9+\-()\s]{7,25}$', clean_phone):
            raise serializers.ValidationError(
                "Phone number format is invalid. Allowed characters: digits, spaces, '+', '-', '(', ')'."
            )
        return clean_phone

    def validate_course(self, value):
        """Ensure course name is specified."""
        clean_course = value.strip()
        if not clean_course:
            raise serializers.ValidationError("Course is required.")
        return clean_course

    def validate_status(self, value):
        """Ensure status matches accepted choices."""
        allowed_statuses = dict(Student.STATUS_CHOICES).keys()
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Invalid status '{value}'. Allowed options: {', '.join(allowed_statuses)}."
            )
        return value
