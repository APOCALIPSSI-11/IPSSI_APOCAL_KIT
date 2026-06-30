# 📖 Plan d'implémentation des Tâches — Romain LEFEVRE

Ce document décrit en détail la stratégie d'implémentation et les modifications de code nécessaires pour accomplir les tâches de test et de documentation qui vous sont attribuées pour la **Release 1 (MVP)** :

*   **US-01 / T-01.4** : Tests pytest endpoint + Vitest composant React
*   **US-02 / T-02.5** : Tests pytest + Vitest + ajout README section upload

---

## 🎯 US-01 : Tests pytest endpoint + Vitest composant React

### 1. Partie Backend (pytest) : Endpoint de correction du Quiz
L'objectif est d'écrire des tests unitaires et d'intégration pour l'endpoint `POST /api/quizzes/<id>/answer/` qui prend en entrée les réponses de l'étudiant, calcule son score et le persiste.

#### 📂 Fichier à analyser/modifier :
* [backend/quizzes/tests.py](file:///c:/Users/Romain/Desktop/apo/IPSSI_APOCAL_KIT/backend/quizzes/tests.py)

#### 💡 Analyse de l'existant :
Ces tests sont déjà présents et couvrent les aspects suivants de l'endpoint :
1.  **`test_answer_all_correct`** : Vérifie qu'envoyer 10 bonnes réponses calcule un score de `10/10`, enregistre le score sur le quiz en base de données et renvoie les détails corrects.
2.  **`test_answer_all_wrong`** : Vérifie qu'envoyer des réponses toutes fausses donne un score de `0/10`.
3.  **`test_answer_partial`** : Vérifie que le score intermédiaire (ex. `5/10`) est calculé correctement.
4.  **`test_answer_requires_10`** : Vérifie que si l'utilisateur envoie moins de 10 réponses (ex. 1 seule), l'API renvoie une erreur `400 Bad Request`.
5.  **`test_answer_404_for_other_users_quiz`** : Garantit l'isolation des données : un utilisateur ne peut pas soumettre de réponses pour le quiz d'un autre utilisateur.

#### 🛠️ Extension possible (Ajout d'un test pour robustesse) :
Si vous devez ajouter un test pour compléter le périmètre, voici comment tester une soumission avec des index hors limites (ex: `selected_index = 99`) :
```python
def test_answer_invalid_selected_index(auth_client, sample_quiz):
    """Envoi d'un index de réponse invalide (ex: 99)."""
    response = auth_client.post(
        f"/api/quizzes/{sample_quiz.id}/answer/",
        {"answers": [{"index": i, "selected_index": 99} for i in range(1, 11)]},
        format="json",
    )
    # L'API doit retourner 200 mais le score doit être 0 car l'index 99 n'est pas correct
    assert response.status_code == 200
    assert response.data["score"] == 0
```

---

### 2. Partie Frontend (Vitest) : Composant React `QuizPage`
Le composant `QuizPage` affiche les questions d'un quiz, gère la sélection des options et permet la soumission. Il faut s'assurer qu'il fonctionne correctement en mimant les appels d'API.

#### 📂 Fichier à créer :
* `frontend/src/pages/QuizPage.test.tsx`

#### 📝 Code complet proposé :
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuizPage from './QuizPage';
import { getQuiz, submitAnswers } from '@/api/quizzes';

// Mock complet des fonctions de l'API des quiz
vi.mock('@/api/quizzes', () => ({
  getQuiz: vi.fn(),
  submitAnswers: vi.fn(),
}));

const mockQuiz = {
  id: 42,
  title: 'Mon Quiz d\'Histoire',
  questions: Array.from({ length: 10 }, (_, i) => ({
    index: i + 1,
    prompt: `Question numéro ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_index: 0, // Option A est la bonne
  })),
};

describe('QuizPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche l\'état de chargement puis le titre du quiz', async () => {
    vi.mocked(getQuiz).mockResolvedValueOnce(mockQuiz);

    render(
      <MemoryRouter initialEntries={['/quiz/42']}>
        <Routes>
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Chargement du quiz…/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mon Quiz d\'Histoire')).toBeInTheDocument();
      expect(screen.getByText('Quiz #42 · 10 questions')).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur si le quiz ne peut pas être chargé', async () => {
    vi.mocked(getQuiz).mockRejectedValueOnce(new Error('Erreur réseau'));

    render(
      <MemoryRouter initialEntries={['/quiz/42']}>
        <Routes>
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger ce quiz.')).toBeInTheDocument();
    });
  });

  it('désactive le bouton de validation tant que les 10 questions ne sont pas répondues', async () => {
    vi.mocked(getQuiz).mockResolvedValueOnce(mockQuiz);

    render(
      <MemoryRouter initialEntries={['/quiz/42']}>
        <Routes>
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Mon Quiz d\'Histoire')).toBeInTheDocument());

    const submitBtn = screen.getByRole('button', { name: /Répondre à toutes les questions/i });
    expect(submitBtn).toBeDisabled();
  });

  it('permet de cocher les 10 réponses, d\'activer la soumission et de voir le résultat', async () => {
    vi.mocked(getQuiz).mockResolvedValueOnce(mockQuiz);
    vi.mocked(submitAnswers).mockResolvedValueOnce({
      score: 10,
      total: 10,
      details: mockQuiz.questions.map((q) => ({
        index: q.index,
        selected_index: 0,
        correct_index: 0,
        correct: true,
      })),
    });

    render(
      <MemoryRouter initialEntries={['/quiz/42']}>
        <Routes>
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Mon Quiz d\'Histoire')).toBeInTheDocument());

    // On clique sur la première option "A." pour les 10 questions
    const allOptionButtons = screen.getAllByText(/A\./i);
    expect(allOptionButtons.length).toBe(10);

    allOptionButtons.forEach((btn) => {
      fireEvent.click(btn);
    });

    // Le bouton doit maintenant être disponible pour la soumission
    const submitBtn = screen.getByRole('button', { name: /Soumettre mes réponses/i });
    expect(submitBtn).toBeEnabled();

    // Clic pour soumettre
    fireEvent.click(submitBtn);

    // Vérification de l'affichage du score final
    await waitFor(() => {
      expect(screen.getByText('Score : 10 / 10')).toBeInTheDocument();
      expect(screen.getByText(/Sans-faute/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 US-02 : Tests pytest + Vitest + ajout README section upload

### 1. Partie Backend (pytest) : Endpoint de génération & Upload de PDF
Il s'agit de tester l'intégration et la validation des fichiers PDF téléversés vers `POST /api/llm/generate-quiz/`.

#### 📂 Fichier à modifier/compléter :
* [backend/llm/tests.py](file:///c:/Users/Romain/Desktop/apo/IPSSI_APOCAL_KIT/backend/llm/tests.py)

#### 📝 Code de test proposé à ajouter :
```python
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch
from quizzes.models import Quiz

@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_with_valid_pdf(auth_client):
    """Envoi d'un fichier PDF valide : extraction simulée."""
    # Faux contenu PDF
    pdf_content = b"%PDF-1.4 ... fake content ..."
    uploaded_file = SimpleUploadedFile("cours.pdf", pdf_content, content_type="application/pdf")

    # On mocke extract_text_from_pdf pour éviter de parser un vrai PDF vide
    with patch("llm.views.extract_text_from_pdf", return_value="Lorem ipsum " * 50):
        response = auth_client.post(
            "/api/llm/generate-quiz/",
            {
                "title": "Cours de Test PDF",
                "pdf": uploaded_file,
            },
            format="multipart",
        )
    
    assert response.status_code == 201
    assert response.data["title"] == "Cours de Test PDF"
    assert Quiz.objects.filter(title="Cours de Test PDF").count() == 1


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_rejects_non_pdf(auth_client):
    """Rejeter un fichier qui n'a pas l'extension .pdf."""
    uploaded_file = SimpleUploadedFile("cours.txt", b"Lorem ipsum dolor sit amet...", content_type="text/plain")
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {
            "title": "Faux PDF",
            "pdf": uploaded_file,
        },
        format="multipart",
    )
    assert response.status_code == 400
    assert "pdf" in response.data  # Erreur de validation levée par le sérialiseur


@override_settings(LLM_BACKEND="mock")
def test_generate_quiz_pdf_too_large(auth_client):
    """Rejeter un fichier PDF qui dépasse 5 Mo."""
    # 5 Mo + 1 octet
    large_content = b"x" * (5 * 1024 * 1024 + 1)
    uploaded_file = SimpleUploadedFile("gros_cours.pdf", large_content, content_type="application/pdf")
    
    response = auth_client.post(
        "/api/llm/generate-quiz/",
        {
            "title": "Cours PDF trop volumineux",
            "pdf": uploaded_file,
        },
        format="multipart",
    )
    assert response.status_code == 400
    assert "detail" in response.data
    assert "trop volumineux" in response.data["detail"]
```

---

### 2. Partie Frontend (Vitest) : Composant React `UploadPage`
Le composant `UploadPage` permet de téléverser un PDF ou de coller un texte de cours pour lancer la génération de quiz. Il faut tester les deux modes et les validations de formulaires.

#### 📂 Fichier à créer :
* `frontend/src/pages/UploadPage.test.tsx`

#### 📝 Code complet proposé :
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UploadPage from './UploadPage';
import { generateQuiz } from '@/api/llm';

// Mock de la redirection (navigation)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de l'appel d'API de génération
vi.mock('@/api/llm', () => ({
  generateQuiz: vi.fn(),
}));

describe('UploadPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le formulaire et ses deux modes', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Créer un nouveau quiz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex. Histoire/i)).toBeInTheDocument();
    
    // Par défaut, le mode texte est sélectionné et sa zone de saisie est affichée
    expect(screen.getByPlaceholderText(/Collez ici le texte/i)).toBeInTheDocument();
  });

  it('permet de basculer en mode PDF', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    const pdfBtn = screen.getByRole('button', { name: /PDF/i });
    fireEvent.click(pdfBtn);

    // La zone de texte disparaît
    expect(screen.queryByPlaceholderText(/Collez ici le texte/i)).not.toBeInTheDocument();
    
    // L'input de type file est affiché
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('soumet le formulaire en mode texte et redirige l\'utilisateur', async () => {
    const fakeQuiz = { id: 10, title: 'Histoire de France', questions: [] };
    vi.mocked(generateQuiz).mockResolvedValueOnce(fakeQuiz as any);

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    // Remplir le titre
    const titleInput = screen.getByPlaceholderText(/Ex. Histoire/i);
    fireEvent.change(titleInput, { target: { value: 'Histoire de France' } });

    // Remplir le texte (>= 200 caractères)
    const textarea = screen.getByPlaceholderText(/Collez ici le texte/i);
    fireEvent.change(textarea, { target: { value: 'a'.repeat(200) } });

    // Soumettre le formulaire
    const submitBtn = screen.getByRole('button', { name: /Générer le quiz/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(generateQuiz).toHaveBeenCalledWith({
        title: 'Histoire de France',
        source_text: 'a'.repeat(200),
        pdf: undefined,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/10');
    });
  });

  it('affiche un bandeau d\'erreur en cas d\'échec de l\'API', async () => {
    vi.mocked(generateQuiz).mockRejectedValueOnce(new Error('Erreur LLM'));

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByPlaceholderText(/Ex. Histoire/i);
    fireEvent.change(titleInput, { target: { value: 'Test Erreur' } });

    const textarea = screen.getByPlaceholderText(/Collez ici le texte/i);
    fireEvent.change(textarea, { target: { value: 'a'.repeat(200) } });

    const submitBtn = screen.getByRole('button', { name: /Générer le quiz/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Échec de la génération/i)).toBeInTheDocument();
    });
  });
});
```

---

### 3. Ajout de la section Upload dans le `README.md`
L'objectif est d'expliquer comment fonctionne la saisie des cours (les contraintes imposées par le backend pour éviter les plantages ou abus).

#### 📂 Fichier à modifier :
* [README.md](file:///c:/Users/Romain/Desktop/apo/IPSSI_APOCAL_KIT/README.md)

#### 📝 Contenu à insérer (Section dédiée) :
Ajouter les lignes suivantes au fichier `README.md` juste après la section **"Déjà inclus"** (ligne 45) :

```markdown
## 📄 Règles d'Upload & Limites (Génération de Quiz)

Pour garantir des performances optimales avec notre modèle LLM local, les règles de validation suivantes s'appliquent lors du dépôt de cours :

1. **Option 1 : Texte brut**
   * Saisie minimale requise : **200 caractères**.
   * Conçu pour le copier-coller rapide de résumés ou de chapitres.

2. **Option 2 : Fichier PDF**
   * Taille maximale autorisée : **5 Mo** (`MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024`).
   * Format accepté : Extension `.pdf` uniquement.
   * **Contrainte technique (sans OCR)** : Le PDF doit contenir du texte sélectionnable. Les PDF numérisés sous forme d'images ne seront pas analysés (le système lèvera une erreur de texte vide).
   * La librairie sous-jacente utilisée est `pypdf`.
```

---

## 🚀 Comment exécuter tous ces tests ?

Puisque les tests sont configurés sur la stack du projet, voici les commandes utiles :

1.  **Exécuter tous les tests (Backend + Frontend)** :
    ```bash
    make test
    ```
2.  **Exécuter uniquement les tests Backend (pytest)** :
    ```bash
    docker compose exec backend pytest
    ```
3.  **Exécuter uniquement les tests Frontend (Vitest)** :
    ```bash
    docker compose exec frontend npm test
    ```
