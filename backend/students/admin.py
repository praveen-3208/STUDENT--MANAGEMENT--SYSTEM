from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """
    Django admin configuration for the Student model.
    Provides search, filtering, and detailed column display for staff.
    """
    list_display = (
        'id',
        'name',
        'email',
        'phone',
        'course',
        'status',
        'date_of_birth',
        'enrollment_date',
    )
    list_filter = ('status', 'course', 'enrollment_date')
    search_fields = ('name', 'email', 'phone', 'course')
    ordering = ('-id',)
    readonly_fields = ('enrollment_date',)
    list_per_page = 25
