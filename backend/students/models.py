from django.db import models


class Student(models.Model):
    """
    Student model representing enrolled individuals in the institution.

    Fields:
    - id: Auto-incrementing primary key.
    - name: Full name of the student (required).
    - email: Unique email address used for contact and identification (required).
    - phone: Contact telephone number (required).
    - date_of_birth: Birthdate for age and demographic verification (required).
    - course: Academic program or enrolled course name (required).
    - enrollment_date: Date student was registered, automatically assigned on creation.
    - status: Active or inactive enrollment status (defaults to 'active').
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(
        max_length=150,
        blank=False,
        null=False,
        help_text="Full legal name of the student"
    )
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        help_text="Unique student email address"
    )
    phone = models.CharField(
        max_length=30,
        blank=False,
        null=False,
        help_text="Contact phone number"
    )
    date_of_birth = models.DateField(
        blank=False,
        null=False,
        help_text="Student date of birth (YYYY-MM-DD)"
    )
    course = models.CharField(
        max_length=120,
        blank=False,
        null=False,
        help_text="Course or degree enrolled in"
    )
    enrollment_date = models.DateField(
        auto_now_add=True,
        help_text="Enrollment date, auto-set upon creation"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Enrollment status: 'active' or 'inactive'"
    )

    class Meta:
        ordering = ['-id']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.course}"
