# Generated by Django 5.0.7 on 2024-08-04 10:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('LMS', '0004_module'),
    ]

    operations = [
        migrations.CreateModel(
            name='Forum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='forum',
                                                to='LMS.course')),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications',
                                           to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('forum',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts', to='LMS.forum')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts',
                                           to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Reply',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('question',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='LMS.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replies',
                                           to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
