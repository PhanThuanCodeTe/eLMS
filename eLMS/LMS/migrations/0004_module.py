# Generated by Django 5.0.7 on 2024-08-04 09:15

import ckeditor.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('LMS', '0003_course'),
    ]

    operations = [
        migrations.CreateModel(
            name='Module',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('youtube_url', models.URLField()),
                ('description', ckeditor.fields.RichTextField()),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='modules',
                                             to='LMS.course')),
            ],
        ),
    ]
