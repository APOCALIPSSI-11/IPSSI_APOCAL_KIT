from django.urls import path

from .views import CourseCreateView, TeacherDashboardView

urlpatterns = [
    path("", CourseCreateView.as_view(), name="course-create"),
    path("dashboard-classe/", TeacherDashboardView.as_view(), name="teacher-dashboard"),
]
