"""Tests pédagogiques pour l'app accounts.

Ces tests servent d'exemples : signup, login, logout, accès protégé.
Lancez : pytest accounts/
"""

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db) -> User:
    return User.objects.create_user(
        username="alice", email="alice@test.com", password="motdepasse123"
    )


def test_signup_creates_user(client):
    # Lot 3 : inscription par EMAIL (username = email en interne).
    response = client.post(
        "/api/accounts/signup/",
        {
            "email": "bob@test.com",
            "password": "motdepasse123",
        },
        format="json",
    )
    assert response.status_code == 201, response.data
    assert User.objects.filter(email="bob@test.com").exists()


def test_signup_requires_email(client):
    response = client.post(
        "/api/accounts/signup/",
        {"password": "motdepasse123"},
        format="json",
    )
    assert response.status_code == 400


def test_signup_password_too_short(client):
    response = client.post(
        "/api/accounts/signup/",
        {"email": "bob@test.com", "password": "short"},
        format="json",
    )
    assert response.status_code == 400


def test_signup_duplicate_email(client, user):
    response = client.post(
        "/api/accounts/signup/",
        {"email": "ALICE@TEST.COM", "password": "password123"},
        format="json",
    )
    assert response.status_code == 400


def test_login_returns_token(client, user):
    response = client.post(
        "/api/accounts/login/",
        {"email": "alice@test.com", "password": "motdepasse123"},
        format="json",
    )
    assert response.status_code == 200, response.data
    assert "token" in response.data
    assert response.data["user"]["email"] == "alice@test.com"


def test_login_with_wrong_password(client, user):
    response = client.post(
        "/api/accounts/login/",
        {"email": "alice@test.com", "password": "wrong"},
        format="json",
    )
    assert response.status_code == 400


def test_me_requires_auth(client):
    response = client.get("/api/accounts/me/")
    assert response.status_code in (401, 403)


def test_me_with_token(client, user):
    from rest_framework.authtoken.models import Token

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/accounts/me/")
    assert response.status_code == 200
    assert response.data["username"] == "alice"


def test_logout_invalidates_token(client, user):
    from rest_framework.authtoken.models import Token

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.post("/api/accounts/logout/")
    assert response.status_code == 204
    # Le token n'existe plus
    assert not Token.objects.filter(key=token.key).exists()


def test_account_deletion_creates_rgpd_audit_log(client, user):
    # T-RGPD-01.3 : la suppression de compte doit journaliser un audit trail
    # RGPD, avec l'email conservé même après le hard delete du User.
    from rest_framework.authtoken.models import Token

    from .models import RGPDRequestLog

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.delete(
        "/api/accounts/profile/",
        {"password": "motdepasse123"},
        format="json",
    )
    assert response.status_code == 204
    assert not User.objects.filter(email="alice@test.com").exists()

    log = RGPDRequestLog.objects.get(user_email="alice@test.com", request_type="delete")
    assert log.timestamp is not None


def test_export_zip_creates_answered_audit_log_with_hash(client, user):
    # T-J3B-2 : l'export (format ZIP par défaut) doit journaliser un audit
    # trail RGPD "answered" avec le hash SHA-256 du fichier renvoyé.
    import hashlib

    from rest_framework.authtoken.models import Token

    from .models import RGPDRequestLog

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/accounts/me/export/")

    assert response.status_code == 200
    expected_hash = hashlib.sha256(response.content).hexdigest()

    log = RGPDRequestLog.objects.get(user_email="alice@test.com", request_type="export")
    assert log.status == RGPDRequestLog.Status.ANSWERED
    assert log.file_hash == expected_hash
    assert len(log.file_hash) == 64


def test_export_json_creates_answered_audit_log_with_hash(client, user):
    # Idem pour le format JSON structuré (?format=json, T-J3B-4).
    from rest_framework.authtoken.models import Token

    from .models import RGPDRequestLog

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/accounts/me/export/?format=json")

    assert response.status_code == 200
    log = RGPDRequestLog.objects.get(user_email="alice@test.com", request_type="export")
    assert log.status == RGPDRequestLog.Status.ANSWERED
    assert log.file_hash is not None
    assert len(log.file_hash) == 64


def test_export_does_not_leak_other_users_audit_logs(client, user):
    # T-J3B-2 : isolation stricte — l'export d'un utilisateur ne doit pas
    # produire ni exposer de log au nom d'un autre utilisateur.
    from rest_framework.authtoken.models import Token

    other = User.objects.create_user(
        username="carol", email="carol@test.com", password="motdepasse123"
    )
    Token.objects.create(user=other)

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/accounts/me/export/")

    assert response.status_code == 200
    from .models import RGPDRequestLog

    assert not RGPDRequestLog.objects.filter(user_email="carol@test.com").exists()


def test_export_json_does_not_leak_other_users_data(client, user):
    # Fiche officielle J3-bis : "vérifier qu'un utilisateur ne reçoit aucune
    # donnée d'un autre (3 tables minimum)". Ici : courses, quizzes, logs.
    from rest_framework.authtoken.models import Token

    from courses.models import Course
    from quizzes.models import Quiz

    other = User.objects.create_user(
        username="carol", email="carol@test.com", password="motdepasse123"
    )
    Course.objects.create(user=other, title="Cours de Carol", content="x" * 250)
    Quiz.objects.create(user=other, title="Quiz de Carol", score=5)

    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/accounts/me/export/?format=json")

    assert response.status_code == 200
    assert response.data["courses"] == []
    assert response.data["quizzes"] == []
    course_titles = [c["title"] for c in response.data["courses"]]
    quiz_titles = [q["title"] for q in response.data["quizzes"]]
    assert "Cours de Carol" not in course_titles
    assert "Quiz de Carol" not in quiz_titles
