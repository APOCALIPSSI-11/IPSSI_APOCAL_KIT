import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from accounts.models import get_or_create_profile
from courses.models import ClassGroup
from quizzes.models import Quiz, Question

pytestmark = pytest.mark.django_db


@pytest.fixture
def teacher():
    user = User.objects.create_user(username="teacher@test.local", email="teacher@test.local", password="password123")
    profile = get_or_create_profile(user)
    profile.role = "teacher"
    profile.save()
    return user


@pytest.fixture
def student1():
    user = User.objects.create_user(username="student1@test.local", email="student1@test.local", password="password123")
    profile = get_or_create_profile(user)
    profile.role = "student"
    profile.save()
    return user


@pytest.fixture
def student2():
    user = User.objects.create_user(username="student2@test.local", email="student2@test.local", password="password123")
    profile = get_or_create_profile(user)
    profile.role = "student"
    profile.save()
    return user


@pytest.fixture
def other_teacher():
    user = User.objects.create_user(username="other_teacher@test.local", email="other_teacher@test.local", password="password123")
    profile = get_or_create_profile(user)
    profile.role = "teacher"
    profile.save()
    return user


@pytest.fixture
def other_student():
    user = User.objects.create_user(username="other_student@test.local", email="other_student@test.local", password="password123")
    profile = get_or_create_profile(user)
    profile.role = "student"
    profile.save()
    return user


@pytest.fixture
def class_group(teacher, student1, student2):
    group = ClassGroup.objects.create(name="Classe de Test", teacher=teacher)
    group.students.add(student1, student2)
    return group


@pytest.fixture
def other_class_group(other_teacher, other_student):
    group = ClassGroup.objects.create(name="Autre Classe", teacher=other_teacher)
    group.students.add(other_student)
    return group


def test_dashboard_requires_authentication():
    client = APIClient()
    response = client.get("/api/courses/dashboard-classe/")
    assert response.status_code in (401, 403)


def test_dashboard_denied_to_students(student1):
    client = APIClient()
    client.force_authenticate(user=student1)
    response = client.get("/api/courses/dashboard-classe/")
    assert response.status_code == 403
    assert response.data["detail"] == "Accès réservé aux enseignants."


def test_dashboard_access_allowed_to_teacher(teacher):
    client = APIClient()
    client.force_authenticate(user=teacher)
    response = client.get("/api/courses/dashboard-classe/")
    assert response.status_code == 200
    assert response.data["total_students"] == 0
    assert response.data["average_score"] is None
    assert response.data["total_quizzes_completed"] == 0
    assert len(response.data["students_progress"]) == 0


def test_dashboard_calculates_correct_kpis(teacher, student1, student2, class_group):
    # Création de quiz pour les étudiants
    # student1 a fait 2 quiz
    q1 = Quiz.objects.create(user=student1, title="Quiz 1", score=8)
    q2 = Quiz.objects.create(user=student1, title="Quiz 2", score=6)
    # student2 a fait 1 quiz
    q3 = Quiz.objects.create(user=student2, title="Quiz 3", score=10)
    # Un quiz non complété (score is None) ne doit pas être compté dans la moyenne
    Quiz.objects.create(user=student2, title="Quiz 4 non complété", score=None)

    client = APIClient()
    client.force_authenticate(user=teacher)
    response = client.get("/api/courses/dashboard-classe/")

    assert response.status_code == 200
    assert response.data["total_students"] == 2
    # Score moyen : (8 + 6 + 10) / 3 = 8.0 sur 10, ce qui équivaut à 80.0%
    assert response.data["average_score"] == 80.0
    assert response.data["total_quizzes_completed"] == 3

    # Vérification de la liste des progrès
    progress = response.data["students_progress"]
    assert len(progress) == 2

    # student1
    p1 = next(p for p in progress if p["email"] == student1.email)
    assert p1["first_name"] == student1.first_name
    assert p1["last_name"] == student1.last_name
    assert p1["quizzes_completed"] == 2
    # Moyenne de student1 : (8 + 6) / 2 = 7.0 sur 10 -> 70.0%
    assert p1["average_score"] == 70.0
    assert p1["last_activity"] is not None

    # student2
    p2 = next(p for p in progress if p["email"] == student2.email)
    assert p2["quizzes_completed"] == 1
    assert p2["average_score"] == 100.0


def test_dashboard_does_not_leak_other_teachers_data(teacher, other_teacher, class_group, other_class_group, student1, other_student):
    # q1 appartient à student1 (classe de teacher)
    Quiz.objects.create(user=student1, title="Quiz Enseignant 1", score=8)
    # q2 appartient à other_student (classe de other_teacher)
    Quiz.objects.create(user=other_student, title="Quiz Autre Enseignant", score=9)

    client = APIClient()
    client.force_authenticate(user=teacher)
    response = client.get("/api/courses/dashboard-classe/")

    assert response.status_code == 200
    assert response.data["total_students"] == 2  # student1 et student2
    assert response.data["total_quizzes_completed"] == 1
    assert response.data["average_score"] == 80.0

    # Vérifier que other_student n'est pas dans les progrès
    emails = [p["email"] for p in response.data["students_progress"]]
    assert other_student.email not in emails
