# Generated by Django 5.0.7 on 2024-09-11 03:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0018_course_author'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
    ]
