from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Full legal name of the student', max_length=150)),
                ('email', models.EmailField(help_text='Unique student email address', max_length=254, unique=True)),
                ('phone', models.CharField(help_text='Contact phone number', max_length=30)),
                ('date_of_birth', models.DateField(help_text='Student date of birth (YYYY-MM-DD)')),
                ('course', models.CharField(help_text='Course or degree enrolled in', max_length=120)),
                ('enrollment_date', models.DateField(auto_now_add=True, help_text='Enrollment date, auto-set upon creation')),
                ('status', models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive')], default='active', help_text="Enrollment status: 'active' or 'inactive'", max_length=10)),
            ],
            options={
                'verbose_name': 'Student',
                'verbose_name_plural': 'Students',
                'ordering': ['-id'],
            },
        ),
    ]
