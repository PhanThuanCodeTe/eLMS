# Generated by Django 5.0.7 on 2024-08-06 03:03

import ckeditor.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('LMS', '0011_module_created_at_alter_course_title_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='num_questions',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='test',
            name='test_type',
            field=models.IntegerField(choices=[(0, 'Trắc nghiệm'), (1, 'Tự luận')], default=0),
        ),
        migrations.CreateModel(
            name='EssayAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer_text', ckeditor.fields.RichTextField()),
                ('teacher_comments', ckeditor.fields.RichTextField(blank=True, null=True)),
                ('question', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='LMS.question')),
            ],
        ),
    ]
