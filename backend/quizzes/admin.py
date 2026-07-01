from django.contrib import admin

from .models import Course, Question, Quiz


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ["index", "prompt", "options", "correct_index"]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "score", "created_at"]
    list_filter = ["user", "created_at"]
    search_fields = ["title", "source_text"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["quiz", "index", "prompt"]
    list_filter = ["quiz"]
    search_fields = ["prompt"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "source", "created_at"]
    list_filter = ["source", "created_at"]
    search_fields = ["title", "content"]
