# Nơi tạo view cho AdminSite
# eLMS/LMS/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import AnswerForm, CustomUserCreationForm, CustomUserChangeForm, CourseForm, ModuleForm, PostForm, \
    ReplyForm, QuestionForm, EssayAnswerForm, CourseMembershipForm, StudentAnswerForm
from .models import User, Category, Course, Module, Post, Reply, Notification, Forum, File, FileType, Test, Question, \
    Answer, EssayAnswer, CourseMembership, StudentScore, StudentAnswer


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'avatar', 'gender', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'avatar', 'gender', 'role')}
        ),
    )
    list_display = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description')


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1  # Số lượng mẫu module mới để thêm


class CourseAdmin(admin.ModelAdmin):
    form = CourseForm
    inlines = [ModuleInline]
    list_display = ('id', 'title', 'cover_image', 'created_at', 'updated_at', 'is_active')


class FileInline(admin.TabularInline):
    model = File
    extra = 1


class ModuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course_title', 'youtube_url')
    search_fields = ('title', 'course__title')
    inlines = [FileInline]
    form = ModuleForm

    def course_title(self, obj):
        return obj.course.title

    course_title.short_description = 'Course Title'


class FileTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)
    search_fields = ('name',)


class ForumAdmin(admin.ModelAdmin):
    list_display = ('id', 'course',)
    search_fields = ('course__title',)


class PostAdmin(admin.ModelAdmin):
    form = PostForm
    list_display = ('id', 'title', 'forum', 'user', 'created_at')
    search_fields = ('title', 'user__username', 'forum__course__title')
    list_filter = ('created_at', 'forum')


class ReplyAdmin(admin.ModelAdmin):
    form = ReplyForm
    list_display = ('id', 'question', 'user', 'created_at')
    search_fields = ('question__title', 'user__username')
    list_filter = ('created_at', 'question')


class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message', 'created_at', 'is_read')
    search_fields = ('user__username', 'message')
    list_filter = ('created_at', 'is_read')
    actions = None  # Disable bulk actions

    def has_add_permission(self, request):
        # Tắt nút thêm trên adminsite
        return False

    def has_change_permission(self, request, obj=None):
        # Cho phép sửa thông báo
        return True

    def has_delete_permission(self, request, obj=None):
        # Cho phép xóa thông báo
        return True


class TestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'module', 'num_questions', 'test_type', 'created_at')
    search_fields = ('name', 'module__title')
    list_filter = ('test_type',)
    readonly_fields = ('num_questions',)  # Make num_questions read-only

    def save_model(self, request, obj, form, change):
        # Automatically update num_questions before saving
        if not change:  # If creating a new Test
            obj.save()
        super().save_model(request, obj, form, change)


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1
    form = AnswerForm


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'type', 'test')
    form = QuestionForm
    search_fields = ('content', 'test__name')
    list_filter = ('type', 'test__name')
    inlines = [AnswerInline]

    def get_inline_instances(self, request, obj=None):
        if obj and obj.type == 0:  # Multiple Choice
            return [AnswerInline(self.model, self.admin_site)]
        return []

    def delete_model(self, request, obj):
        test = obj.test
        obj.delete()
        test.update_num_questions()

    def delete_queryset(self, request, queryset):
        tests = set(obj.test for obj in queryset)
        super().delete_queryset(request, queryset)
        for test in tests:
            test.update_num_questions()


class AnswerAdmin(admin.ModelAdmin):
    form = AnswerForm
    list_display = ('id', 'question', 'choice', 'is_correct')
    search_fields = ('question__content', 'choice')
    list_filter = ('is_correct',)


class EssayAnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'user', 'score', 'teacher_comments')
    search_fields = ('user__username', 'question__content')
    list_filter = ('score',)
    form = EssayAnswerForm

    def save_model(self, request, obj, form, change):
        try:
            obj.save()
        except ValueError as e:
            self.message_user(request, str(e), level='error')


class CourseMembershipAdmin(admin.ModelAdmin):
    form = CourseMembershipForm
    list_display = ('user', 'course', 'attend_date', 'finish_date', 'progress', 'is_active')
    list_filter = ('course', 'is_active', 'attend_date', 'finish_date')
    search_fields = ('user__username', 'course__title')


class StudentScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'last_modified')
    readonly_fields = ('last_modified',)


class StudentAnswerAdmin(admin.ModelAdmin):
    form = StudentAnswerForm
    list_display = ('user', 'question', 'selected_answer', 'is_correct')
    search_fields = ('user__username', 'question__content')
    list_filter = ('is_correct', 'question__test')

    def save_model(self, request, obj, form, change):
        try:
            obj.save()
        except ValueError as e:
            self.message_user(request, str(e), level='error')


admin.site.register(Category, CategoryAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Reply, ReplyAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Forum, ForumAdmin)
admin.site.register(FileType, FileTypeAdmin)
admin.site.register(Test, TestAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(EssayAnswer, EssayAnswerAdmin)
admin.site.register(CourseMembership, CourseMembershipAdmin)
admin.site.register(StudentScore, StudentScoreAdmin)
admin.site.register(StudentAnswer, StudentAnswerAdmin)