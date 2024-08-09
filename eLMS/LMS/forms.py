# Form dùng quản lý cách nhập dữ liệu
# eLMS/LMS/forms.py

from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.core.exceptions import ValidationError

from .models import Answer, User, Course, Module, Post, Question, Test, EssayAnswer, CourseMembership, StudentAnswer


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        question = cleaned_data.get('question')

        if question:
            # Xem xem phải loại là trắc nghiệm hay không?
            if question.type != 0:
                self.add_error('question', "Không thể thêm câu trả lời trong 1 câu hỏi tự luận.")

            # Xem câu trắc nghiệm đã đủ 4 đáp án hay chưa
            if question.answers.count() >= 4:
                self.add_error('question', "Câu hỏi trắc nghiệm chỉ có 4 đáp án.")

        return cleaned_data

    def __init__(self, *args, **kwargs):
        self.question = kwargs.pop('question', None)
        super().__init__(*args, **kwargs)
        if self.question and self.question.type != 0:
            self.fields['choice'].widget.attrs['readonly'] = True
            self.fields['is_correct'].widget.attrs['readonly'] = True


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'avatar', 'gender', 'role')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if '@' not in email:
            raise ValidationError("Không đúng định dạng email!")
        return email

    # Hàm check xem đã gửi avatar chưa
    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar')
        if not avatar:
            raise ValidationError("Bạn phải nhập avatar!")
        return avatar

    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = user.email  # Tự động điền username là email
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'avatar', 'gender', 'role')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if '@' not in email:
            raise ValidationError("Không đúng định dạng email!")
        return email

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar')
        if not avatar:
            raise ValidationError("Bạn phải nhập avatar!")
        return avatar


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get('title')
        cover_image = cleaned_data.get('cover_image')
        description = cleaned_data.get('description')

        if not title:
            self.add_error('title', "Khóa học phải có tên khóa học")
        if not cover_image:
            self.add_error('cover_image', "Phải có ảnh bìa khóa học")
        if not description:
            self.add_error('description', "Phải có mô tả khóa học")

        return cleaned_data


class ModuleForm(forms.ModelForm):
    class Meta:
        model = Module
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        youtube_url = cleaned_data.get('youtube_url')

        if not youtube_url:
            self.add_error('youtube_url', "Phải có 1 video cho 1 Module")

        return cleaned_data


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get('title')
        body = cleaned_data.get('body')

        if not title:
            self.add_error('title', "Phải có Tiêu đề cho câu hỏi trên diễn đàn")
        if not body:
            self.add_error('body', "Phải có nội dung")

        return cleaned_data


class ReplyForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        body = cleaned_data.get('body')

        if not body:
            self.add_error('body', "Phải có nội dung")

        return cleaned_data


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['test', 'content', 'type']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically set type choices based on the test type
        if 'test' in self.data:
            try:
                test_id = int(self.data.get('test'))
                test = Test.objects.get(pk=test_id)  # Thay đổi từ Question sang Test
                if test.test_type == 0:  # Multiple Choice
                    self.fields['type'].choices = [(0, 'Trắc nghiệm')]
                elif test.test_type == 1:  # Essay
                    self.fields['type'].choices = [(1, 'Tự luận')]
            except (ValueError, TypeError, Test.DoesNotExist):  # Thay đổi từ Question sang Test
                pass

    def clean(self):
        cleaned_data = super().clean()
        test = cleaned_data.get("test")
        question_type = cleaned_data.get("type")

        if test and question_type:
            # Validate question type based on test type
            if test.test_type == 0 and question_type != 0:
                self.add_error('type', 'For multiple choice tests, only multiple choice questions are allowed.')
            elif test.test_type == 1 and question_type != 1:
                self.add_error('type', 'For essay tests, only essay questions are allowed.')

        return cleaned_data


class EssayAnswerForm(forms.ModelForm):
    class Meta:
        model = EssayAnswer
        fields = ['question', 'user', 'answer_text', 'teacher_comments', 'score']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Lọc các câu hỏi để chỉ hiển thị các câu hỏi tự luận
        self.fields['question'].queryset = Question.objects.filter(type=1)


class CourseMembershipForm(forms.ModelForm):
    class Meta:
        model = CourseMembership
        fields = ['user', 'course', 'attend_date', 'finish_date', 'progress', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Lọc các khóa học để chỉ hiển thị các khóa học đang active
        self.fields['course'].queryset = Course.objects.filter(is_active=True)

    def clean(self):
        cleaned_data = super().clean()
        attend_date = cleaned_data.get('attend_date')
        finish_date = cleaned_data.get('finish_date')
        progress = cleaned_data.get('progress')

        if finish_date and attend_date > finish_date:
            self.add_error('attend_date', 'Ngày tham gia không được sớm hơn ngày hoàn thành khóa học.')

        if progress < 0 or progress > 100:
            self.add_error('progress', 'Tiến độ học tập phải nằm trong khoảng từ 0 đến 100.')

        return cleaned_data

    def clean_progress(self):
        progress = self.cleaned_data.get('progress')
        if progress < 0 or progress > 100:
            raise forms.ValidationError('Tiến độ học tập phải nằm trong khoảng từ 0 đến 100.')
        return progress


class StudentAnswerForm(forms.ModelForm):
    class Meta:
        model = StudentAnswer
        fields = ['user', 'question', 'selected_answer']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Lọc đáp án để chỉ hiển thị các đáp án của câu hỏi liên quan
        if 'question' in self.data:
            try:
                question_id = int(self.data.get('question'))
                self.fields['selected_answer'].queryset = Answer.objects.filter(question_id=question_id)
            except (ValueError, TypeError):
                pass  # handle the case where `question` is not a valid integer
        elif self.instance.pk:
            self.fields['selected_answer'].queryset = self.instance.question.answers.all()
