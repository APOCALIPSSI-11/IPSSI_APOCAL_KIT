"""Tests pour l'app llm — K1 (ping) + K2 (generate-quiz)."""

import pytest
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APIClient

from quizzes.models import Quiz

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


from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from llm.pdf_utils import extract_text_from_pdf, PDFError


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
    assert response.status_code == 201, response.data
    assert response.data["title"] == "PDF Test"
    mock_extract.assert_called_once()


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_invalid_file_type(auth_client):
    txt_file = SimpleUploadedFile("test.txt", b"Lorem ipsum dolor sit amet", content_type="text/plain")

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

