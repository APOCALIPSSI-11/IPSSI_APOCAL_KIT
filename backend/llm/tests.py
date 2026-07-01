"""Tests pour l'app llm — K1 (ping) + K2 (generate-quiz)."""

from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import override_settings
from rest_framework.test import APIClient

from quizzes.models import Question, Quiz

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client() -> APIClient:
    user = User.objects.create_user(username="alice", password="motdepasse123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@override_settings(LLM_BACKEND="mock")
def test_ping_in_mock_mode():
    response = APIClient().get("/api/llm/ping/")
    assert response.status_code == 200
    assert response.data["backend"] == "mock"


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_with_text(auth_client):
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {
            "title": "Mon cours de test",
            "source_text": "Lorem ipsum " * 50,
        },
        format="multipart",
    )
    assert response.status_code == 201, response.data
    assert response.data["title"] == "Mon cours de test"
    assert len(response.data["questions"]) == 10
    assert Quiz.objects.filter(title="Mon cours de test").count() == 1


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_requires_text_or_pdf(auth_client):
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {"title": "Sans contenu"},
        format="multipart",
    )
    assert response.status_code == 400


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_rejects_short_text(auth_client):
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {"title": "Trop court", "source_text": "Court"},
        format="multipart",
    )
    assert response.status_code == 400


def test_generate_quiz_requires_auth():
    response = APIClient().post(
        "/api/llm/generate-quiz/",
        {"title": "X", "source_text": "x" * 200},
        format="multipart",
    )
    assert response.status_code in (401, 403)


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_rolls_back_on_question_insert_failure(auth_client):
    """T-03.3 — une erreur SQL sur la question 5 ne doit laisser aucune trace en base."""
    real_create = Question.objects.create

    def flaky_create(*args, **kwargs):
        if kwargs.get("index") == 5:
            raise IntegrityError("Erreur simulée d'insertion sur la question 5")
        return real_create(*args, **kwargs)

    with patch("quizzes.models.Question.objects.create", side_effect=flaky_create):
        with pytest.raises(IntegrityError):
            auth_client.post(
                "/api/llm/generate-quiz/",
                {
                    "title": "Quiz voué à échouer",
                    "source_text": "Lorem ipsum " * 50,
                },
                format="multipart",
            )

    assert Quiz.objects.filter(title="Quiz voué à échouer").count() == 0
    assert Question.objects.filter(prompt__icontains="Quiz voué à échouer").count() == 0
