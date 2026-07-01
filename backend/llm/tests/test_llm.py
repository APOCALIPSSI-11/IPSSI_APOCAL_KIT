"""Tests pour l'app llm — K1 (ping) + K2 (generate-quiz)."""

import time
from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import override_settings
from rest_framework.test import APIClient

from llm.pdf_utils import PDFError, extract_text_from_pdf
from quizzes.models import Question, Quiz

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client() -> APIClient:
    user = User.objects.create_user(username="alice", password="motdepasse123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _wait_for_questions(quiz_id: int, expected: int, timeout: float = 5.0) -> int:
    """Attend que le thread de génération asynchrone (T-23.3) ait écrit `expected`
    questions en base, ou que le timeout expire. Nécessaire car POST /generate-quiz/
    répond 202 immédiatement puis génère les questions en tâche de fond."""
    deadline = time.monotonic() + timeout
    count = Question.objects.filter(quiz_id=quiz_id).count()
    while count < expected and time.monotonic() < deadline:
        time.sleep(0.05)
        count = Question.objects.filter(quiz_id=quiz_id).count()
    return count


@override_settings(LLM_BACKEND="mock")
def test_ping_in_mock_mode():
    response = APIClient().get("/api/llm/ping/")
    assert response.status_code == 200
    assert response.data["backend"] == "mock"


@pytest.mark.django_db(transaction=True)
@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_with_text(auth_client):
    """T-23.3 — génération asynchrone : la requête répond 202 immédiatement,
    les questions arrivent ensuite via le thread d'arrière-plan."""
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {
            "title": "Mon cours de test",
            "source_text": "Lorem ipsum " * 50,
        },
        format="multipart",
    )
    assert response.status_code == 202, response.data
    assert response.data["status"] == "generating"
    quiz_id = response.data["id"]

    assert _wait_for_questions(quiz_id, expected=10) == 10
    assert Quiz.objects.filter(id=quiz_id, title="Mon cours de test").count() == 1


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


# --- Tests PDF upload (T-02.5 — Romain LEFEVRE) ---


@pytest.mark.django_db(transaction=True)
@override_settings(LLM_BACKEND="mock")
@patch("llm.views.extract_text_from_pdf")
def test_generate_quiz_valid_pdf_success(mock_extract, auth_client):
    mock_extract.return_value = "Lorem ipsum " * 50
    pdf_file = SimpleUploadedFile("cours.pdf", b"%PDF-1.4...", content_type="application/pdf")

    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {"title": "PDF Test", "pdf": pdf_file},
        format="multipart",
    )
    assert response.status_code == 202, response.data
    assert response.data["status"] == "generating"
    mock_extract.assert_called_once()

    assert _wait_for_questions(response.data["id"], expected=10) == 10


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_invalid_file_type(auth_client):
    txt_file = SimpleUploadedFile(
        "test.txt", b"Lorem ipsum dolor sit amet", content_type="text/plain"
    )

    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {"title": "Invalid File Test", "pdf": txt_file},
        format="multipart",
    )
    assert response.status_code == 400


def test_extract_text_from_pdf_too_large():
    class DummyFile:
        size = 5 * 1024 * 1024 + 1

    with pytest.raises(PDFError) as exc:
        extract_text_from_pdf(DummyFile())
    assert "trop volumineux" in str(exc.value)


# --- Test de rollback transactionnel (T-03.3 — J3/Seer) ---


@pytest.mark.django_db(transaction=True)
@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_rolls_back_on_question_insert_failure(auth_client):
    """T-03.3 — une erreur SQL sur la question 5 ne doit laisser aucune question
    en base (rollback atomique du bloc `transaction.atomic()` dans _generate_async).

    Depuis le passage en génération asynchrone (T-23.3), le Quiz est créé et commité
    par la requête HTTP AVANT que la génération ne parte en tâche de fond : il n'est
    donc plus possible d'obtenir un rollback du Quiz lui-même (l'exception est
    capturée et journalisée dans le thread, jamais remontée au client). Seule
    l'absence de questions partielles reste garantie."""
    real_create = Question.objects.create

    def flaky_create(*args, **kwargs):
        if kwargs.get("index") == 5:
            raise IntegrityError("Erreur simulée d'insertion sur la question 5")
        return real_create(*args, **kwargs)

    with patch("quizzes.models.Question.objects.create", side_effect=flaky_create):
        response = auth_client.post(
            "/api/llm/generate-quiz/",
            {
                "title": "Quiz voué à échouer",
                "source_text": "Lorem ipsum " * 50,
            },
            format="multipart",
        )
        assert response.status_code == 202, response.data
        quiz_id = response.data["id"]

        # Laisse le temps au thread d'arrière-plan d'échouer (aucune question
        # n'apparaîtra jamais ; le timeout laisse le rollback atomique se produire).
        assert _wait_for_questions(quiz_id, expected=1, timeout=2.0) == 0

    assert Quiz.objects.filter(id=quiz_id).count() == 1  # le quiz reste (créé avant génération)
    assert Question.objects.filter(quiz_id=quiz_id).count() == 0  # rollback atomique respecté
