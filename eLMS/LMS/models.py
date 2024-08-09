# Nơi tạo model để ánh xạ xuống csdl
# eLMS/LMS/models.py

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from cloudinary.models import CloudinaryField
import cloudinary
import cloudinary.uploader
import cloudinary.api
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model
from django.utils import timezone


# Model lưu User lấy từ mẫu có sẵn từ Django
class User(AbstractUser):
    email = models.EmailField(unique=True)  # email
    avatar = CloudinaryField('avatar', blank=True, null=True)   # Avatar bắt buộc
    gender = models.IntegerField(choices=[(0, 'Male'), (1, 'Female')], default=0)   # Giới tính
    role = models.IntegerField(choices=[(0, 'Student'), (1, 'Teacher')], default=0) # Vai trò (Student = người học, Teacher = giáo viên)

    USERNAME_FIELD = 'email'    # lấy email để đăng nhập
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    # Lấy link ảnh avatar
    def get_avatar_url(self):
        if self.avatar:
            return cloudinary.utils.cloudinary_url(str(self.avatar))[0]
        return None

    # Hàm quét thông tin bắt buộc phải có
    def clean(self):
        super().clean()
        if '@' not in self.email:
            raise ValidationError("Không đúng định dạng email!")
        if not self.avatar:
            raise ValidationError("Bạn phải nhập avatar!")


# Model lưu danh mục
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)    # Tên danh mục
    description = models.TextField(blank=True, null=True)   # Mô tả để đây để mai mốt ghi vô chứ không biết
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo
    updated_at = models.DateTimeField(auto_now=True)    # Ngày cập nhật

    def __str__(self):
        return self.name


# Model lưu Khóa học
class Course(models.Model):
    title = models.CharField(max_length=100)    # Tên khóa học
    cover_image = CloudinaryField('cover_image')  # Ảnh bìa khóa học
    description = models.TextField()    # Mô tả khóa học
    categories = models.ManyToManyField(Category, related_name='courses')  # Quan hệ nhiều - nhiều với Category
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo
    updated_at = models.DateTimeField(auto_now=True)    # Ngày cập nhật
    is_active = models.BooleanField(default=True)  # Trạng thái của khóa học

    # Hàm tự động tạo Forum cho khóa học
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Tạo Forum cho khóa học nếu chưa tồn tại
        if not hasattr(self, 'forum'):
            Forum.objects.create(course=self)

    def __str__(self):
        return self.title


# Model quản lý Module của từng khóa học
class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)    # Khóa ngoại đến Course thuộc khóa học nào / n - 1
    title = models.CharField(max_length=100, blank=True, null=True) # Tên module
    youtube_url = models.URLField()  # URL YouTube (bắt buộc)
    description = RichTextField()  # Mô tả bài học | CKEditor
    created_at = models.DateTimeField(default=timezone.now)  # Ngày tạo dùng để sắp xếp thứ tự module

    def __str__(self):
        return f"{self.title} - {self.course.title}"


# Model lưu Forum của từng khóa học
class Forum(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='forum') # Tôi không biết tạo ra forum để làm gì nhưng dùng cho mục đích sau này

    def __str__(self):
        return f"Forum for {self.course.title}"


# Model lưu câu hỏi trong khóa học
class Post(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='posts')    # Khóa ngoại đến Forum xác định xem thuộc Forum nào / 1 - n
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')  # Khóa ngoại đến User xác định ai đăng / 1 - n
    title = models.CharField(max_length=255)    # Tiêu đề câu hỏi
    body = models.TextField()   # Nội dung câu hỏi
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo

    def __str__(self):
        return self.title


# Model lưu câu trả lời cho câu hỏi
class Reply(models.Model):
    question = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='replies')    # Khóa ngoại đến Post xác định câu hỏi nào / 1 - n
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')    # Khóa ngoại đến User xác định ai trả lời / 1 - n
    body = models.TextField()   # Nội dung câu trả lời
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo

    def __str__(self):
        return f"Reply to {self.question.title} by {self.user.username}"

    #Hàm tự động tạo 1 Thông báo khi một người trả lời câu hỏi
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        Notification.objects.create(
            user=self.question.user,
            message=f"{self.user.username} đã trả lời câu hỏi '{self.question.title}' vào {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}",
            created_at=timezone.now()
        )


# Model lưu thông báo
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications') # Khóa ngoại đến User xác định ai trả lời / 1 - n
    message = models.TextField()    # Nội dung thông báo
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo
    is_read = models.BooleanField(default=False)    # Đã dọc hay chưa

    def __str__(self):
        return f"Notification for {self.user.username} about {self.message}"

    # Hàm quản lý không cho nhập vào database
    def save(self, *args, **kwargs):
        if self.pk is None:
            raise PermissionError("Bạn không được tạo thông báo!")
        super().save(*args, **kwargs)


# Model quản lý các loại File
class FileType(models.Model):
    name = models.CharField(max_length=50, default="Liên kết") # Tên

    def __str__(self):
        return self.name


# Model quản lý các file trong module
class File(models.Model):
    module = models.ForeignKey(Module, related_name='files', on_delete=models.CASCADE) # Khóa ngoại đến Module xác định thuộc module nào / 1 - n
    file_url = models.URLField()    # Đường link File
    file_type = models.ForeignKey(FileType, related_name='files', on_delete=models.CASCADE, default=1)  # Khóa ngoại đến FileType xác định loại File \ 1 - 1

    def __str__(self):
        return f"File for {self.module.title}"


# Model quản lý các bài kiểm tra trong Module
class Test(models.Model):
    TEST_TYPES = [
        (0, 'Trắc nghiệm'),
        (1, 'Tự luận'),
    ]

    module = models.ForeignKey(Module, related_name='tests', on_delete=models.CASCADE)  # Khóa ngoại đến Module xác định thuộc module nào / 1 - n
    name = models.CharField(max_length=255, blank=True, null=True) # Tên bài kiểm tra
    created_at = models.DateTimeField(auto_now_add=True)    # Ngày tạo
    num_questions = models.PositiveIntegerField(default=0)  # Số lượng câu hỏi trong bài Test
    test_type = models.IntegerField(choices=TEST_TYPES, default=0)  # Loại bài kiểm tra ("Trắc ngiệm", "Tự luận")

    # Hàm sắp xếp
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Test for {self.module.title} - {self.name or 'Unnamed'}"

    # Hàm cập nhật số lượng khi thêm và bớt câu hỏi
    def update_num_questions(self):
        self.num_questions = self.questions.count()
        self.save()


# Model quản lý câu hỏi trong Test
class Question(models.Model):
    QUESTION_TYPES = [
        (0, 'Trắc nghiệm'),
        (1, 'Tự luận'),
    ]

    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE)  # Khóa ngoại đến Test xác định thuộc bài kiểm tra nào / 1 - n
    content = RichTextField()   # Nội dung câu hỏi
    type = models.IntegerField(choices=QUESTION_TYPES)  # Loại câu hỏi

    # Hàm quản lý tạo câu hỏi
    def save(self, *args, **kwargs):
        # Check xem loại bài kiểm tra là gì thì chỉ có câu hỏi đó thôi
        if self.test.test_type == 0 and self.type != 0:
            raise ValidationError("For multiple choice tests, only multiple choice questions are allowed.")
        elif self.test.test_type == 1 and self.type != 1:
            raise ValidationError("For essay tests, only essay questions are allowed.")

        super().save(*args, **kwargs)
        # Update number of questions in test
        self.test.update_num_questions()

    # Xóa thì cập nhật trên Test
    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        # Update number of questions in test
        self.test.update_num_questions()

    def __str__(self):
        return f"Question ID {self.id} for {self.test.name or 'Unnamed'} - {self.get_type_display()} - {self.content[:20]}"


# Model quản lý câu trả lời cho câu hỏi trắc nghiệm
class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)    # Khóa ngoại đến Question xác định câu hỏi / 1 - 4
    choice = models.TextField() # Nội dung đáp án
    is_correct = models.BooleanField(default=False) # True => Đây là câu trả ời đúng

    # Hàm quản lý lưu => không có đáp án trắc nghiệm trong câu tự luận và số đáp án không được vượt quá 4
    def save(self, *args, **kwargs):
        if self.question.type != 0:
            raise ValidationError("Câu hỏi tự luận không có đáp án!")

        if self.question.answers.count() >= 4:
            raise ValidationError("Số lượng đáp án không được vượt quá 4!")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Answer for {self.question.content[:20]} - {'Correct' if self.is_correct else 'Incorrect'}"


class EssayAnswer(models.Model):
    question = models.OneToOneField('Question', on_delete=models.CASCADE)  # Khóa ngoại đến Question xác định câu hỏi tự luận
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='essay_answers')  # Khoá ngoại đến User xác định user nào làm bài
    answer_text = RichTextField()  # Ô trả lời
    teacher_comments = RichTextField(blank=True, null=True)  # Nhận xét của giáo viên
    score = models.IntegerField(default=0)  # Trường điểm, giá trị mặc định là 0, số nguyên từ 0 đến 100

    def __str__(self):
        return f"Essay Answer for {self.question.content[:20]} by {self.user.username}"

    def save(self, *args, **kwargs):
        if not (0 <= self.score <= 100):
            raise ValueError("Score must be between 0 and 100")
        super().save(*args, **kwargs)
        # Tạo hoặc cập nhật StudentScore
        score_record, created = StudentScore.objects.get_or_create(user=self.user, test=self.question.test)
        if score_record.score != self.score:
            score_record.score = self.score
            score_record.save()



class CourseMembership(models.Model):
    user = models.ForeignKey(User, related_name='course_memberships', on_delete=models.CASCADE) # Khóa ngoại đến User xác định user nào đăng ký khóa học / n - n
    course = models.ForeignKey('Course', related_name='course_memberships', on_delete=models.CASCADE)   # Khóa ngoại đến Course xác định đăng ký khóa học nào / n - n
    attend_date = models.DateField()  # Ngày tham gia khóa học
    finish_date = models.DateField(blank=True, null=True)  # Ngày hoàn thành khóa học (có thể để trống)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Tiến độ học tập, mặc định là 0%
    is_active = models.BooleanField(default=True)  # Trạng thái hoạt động của thành viên trong khóa học

    class Meta:
        unique_together = ('user', 'course')  # Đảm bảo mỗi user chỉ có một membership cho mỗi course

    def __str__(self):
        return f"{self.user.username} in {self.course.title}"


class StudentScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_modified = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        self.last_modified = timezone.now()
        super(StudentScore, self).save(*args, **kwargs)


class StudentAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name='student_answers', on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Xác định đáp án đúng hay sai
        self.is_correct = self.selected_answer.is_correct
        super().save(*args, **kwargs)
        # Cập nhật điểm số của học sinh cho bài kiểm tra
        self.update_student_score()

    def update_student_score(self):
        # Lấy tất cả câu trả lời của học sinh cho bài kiểm tra này
        student_answers = StudentAnswer.objects.filter(user=self.user, question__test=self.question.test)
        correct_answers = student_answers.filter(is_correct=True).count()
        total_questions = self.question.test.questions.count()

        # Tính điểm số tổng hợp (tính theo phần trăm)
        score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        # Cập nhật điểm số của học sinh
        score_record, created = StudentScore.objects.get_or_create(user=self.user, test=self.question.test)
        score_record.score = score_percentage
        score_record.save()
