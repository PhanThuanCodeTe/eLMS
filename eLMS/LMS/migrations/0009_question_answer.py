# Generated by Django 5.0.7 on 2024-08-05 05:42

import ckeditor.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('LMS', '0008_test'),
    ]

    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', ckeditor.fields.RichTextField()),
                ('type', models.IntegerField(choices=[(0, 'Multiple Choice'), (1, 'Essay')])),
                ('test', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions',
                                           to='LMS.test')),
            ],
        ),
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice', models.TextField()),
                ('is_correct', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers',
                                               to='LMS.question')),
            ],
        ),
    ]
