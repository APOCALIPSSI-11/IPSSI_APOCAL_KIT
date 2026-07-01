# Journal des modifications — Sprint J4 — Frederick TOUFIK

> Date : 2026-07-01
> Branche : `fred`

---

## Vue d'ensemble des tâches

| Tâche | Titre | Statut avant | Statut après |
|---|---|---|---|
| T-23.2 | Barre de progression frontend | To Do | **Done** |
| T-23.3 | Polling / rafraîchissement 5 s | To Do | **Done** |
| T-J3B-4 | Conformité format export JSON | Todo | **Done** |
| T-SEC-01r | Séparation system/user Ollama `/api/chat` | Todo | **Done** |
| T-26.2 | Endpoint signup-enseignant | Done | Done (déjà fait) |

---

## T-23.2 — Barre de progression de génération dédiée (UI)

### Fichiers concernés
- `frontend/src/components/ProgressBar.tsx` — **CRÉÉ** (déjà présent en code)
- `frontend/src/pages/UploadPage.tsx` — **INTÉGRÉ** (déjà présent en code)

### Ce qui a été constaté
Le composant `ProgressBar.tsx` était **déjà implémenté** conformément à la spécification, tout comme son intégration dans `UploadPage.tsx`. La tâche était effectivement réalisée mais marquée comme "To Do" dans le fichier de tâche.

### Détail du composant `ProgressBar.tsx`

**Logique de progression non linéaire** (via `setInterval` 500 ms) :
- `0 % → 50 %` : +2,5 % par tick (progression rapide rassurante)
- `50 % → 80 %` : +0,8 % par tick (ralentissement progressif)
- `80 % → 95 %` : +0,1 % par tick (plafonnement visible)
- Bloqué à 95 % jusqu'à réception de la réponse API

**Messages d'étapes** selon le pourcentage :
- `0–25 %` : `📥 Analyse du cours et extraction du texte...`
- `25–60 %` : `🤖 Inférence LLM locale et formulation des questions...`
- `60–85 %` : `✍️ Rédaction des distracteurs et choix pédagogiques...`
- `85–95 %` : `🔍 Validation du JSON et enregistrement du quiz...`

**Points de conformité validés** :
- `if (!active) return null` placé **après** tous les `useEffect` (règle des hooks React)
- `clearInterval` retourné dans le cleanup du premier `useEffect` → pas de fuite mémoire
- `transition-all duration-500 ease-out` en CSS pour lisser les sauts d'incréments discrets
- Props API : `<ProgressBar active={loading} />` — un seul prop booléen

### Intégration dans `UploadPage.tsx`
```tsx
// Ligne 3 : import
import ProgressBar from '@/components/ProgressBar';

// Ligne 308 : usage après le bouton submit
<ProgressBar active={loading} />
```

### Modifications apportées
- Statut dans le fichier de tâche mis à jour : `To Do` → `Done`
- Cases Definition of Done cochées (6/6)

---

## T-23.3 — Polling / rafraîchissement toutes les 5 secondes

### Fichiers concernés
- `backend/quizzes/views.py` — **`QuizStatusView` CRÉÉE** (déjà présente)
- `backend/quizzes/urls.py` — **route `/status/` ENREGISTRÉE** (déjà présente)
- `frontend/src/api/llm.ts` — **`getQuizStatus` AJOUTÉE** (déjà présente)
- `frontend/src/pages/UploadPage.tsx` — **boucle de polling CÂBLÉE** (déjà présente)

### Ce qui a été constaté
Comme T-23.2, l'ensemble de la tâche était **déjà implémenté** mais marqué "To Do".

### Backend — `QuizStatusView` (`backend/quizzes/views.py` ligne 166)
```python
class QuizStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        quiz = get_object_or_404(Quiz, pk=pk, user=request.user)
        if quiz.questions.count() == 10:
            return Response({"status": "completed"})
        return Response({"status": "generating"})
```
Sécurité garantie : `get_object_or_404(Quiz, pk=pk, user=request.user)` — un utilisateur ne peut sonder que ses propres quizzes.

### Backend — Route (`backend/quizzes/urls.py` ligne 12)
```python
path("<int:pk>/status/", QuizStatusView.as_view(), name="quiz-status"),
```

### Frontend — `getQuizStatus` (`frontend/src/api/llm.ts` ligne 42)
```typescript
export async function getQuizStatus(quizId: number): Promise<QuizStatus> {
  const { data } = await api.get<QuizStatus>(`/quizzes/${quizId}/status/`);
  return data;
}
```

### Frontend — Boucle de polling (`UploadPage.tsx`)
Constantes globales :
```typescript
const POLL_INTERVAL_MS = 5_000;   // 5 secondes entre chaque tick
const MAX_POLL_TICKS = 120;        // garde-fou : 10 min max
```

Mécanisme :
- `intervalRef` : `useRef` (pas `useState`) pour éviter les re-renders et stocker proprement l'ID
- `useEffect` vide au démontage : `clearInterval(intervalRef.current)` → pas de fuite mémoire
- `MAX_FAILS = 5` : coupe le polling après 5 erreurs réseau consécutives
- `ticks > MAX_POLL_TICKS` : timeout absolu de 10 minutes

### Modifications apportées
- Statut dans les fichiers de tâche mis à jour : `To Do` → `Done`
- Cases Definition of Done cochées (6/6)

---

## T-J3B-4 — Conformité format endpoint export (JSON structuré)

### Fichier modifié
- `backend/accounts/views.py` — classe `ExportDataView`

### Problème initial
`ExportDataView.get()` renvoyait **uniquement** un fichier binaire ZIP. La perturbation J3-bis (RGPD Art. 15) exige la possibilité d'obtenir les données en JSON structuré via le paramètre `?format=json`, sans casser le comportement ZIP existant.

### Modifications apportées

**1. Import de `Question` dans la méthode**
```python
from quizzes.models import Question, Quiz
```
Ajout de `Question` pour permettre la reconstruction de l'historique des réponses (champ `selected_index`).

**2. Refactorisation de la construction des données**
La construction de `quizzes_data` (boucle `prefetch_related("questions")`) est déplacée **avant** la détection du format, car les deux branches (ZIP et JSON) partagent cette structure.

**3. Branche `?format=json` (nouvelle)**
```python
format_param = request.query_params.get("format", "").lower()
if format_param == "json":
    answers_data = [
        {
            "quiz_id": q.quiz_id,
            "question_index": q.index,
            "selected_index": q.selected_index,
            "correct_index": q.correct_index,
            "is_correct": q.selected_index == q.correct_index,
        }
        for q in Question.objects.filter(
            quiz__user=user, selected_index__isnull=False
        ).order_by("quiz_id", "index")
    ]
    return Response(
        {
            "user": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": profile.role,
            },
            "quizzes": quizzes_data,
            "answers": answers_data,
            "logs": [],
        },
        status=status.HTTP_200_OK,
    )
```

Structure JSON retournée :
- `user` : profil (email, prénom, nom, rôle)
- `quizzes` : liste des quiz avec toutes leurs questions
- `answers` : toutes les réponses données (questions avec `selected_index` non null)
- `logs` : liste vide (`RGPDRequestLog` non encore implémenté dans le projet)

**Isolation sécurité RGPD** :
- Quiz filtrés par `user=user`
- Questions filtrées par `quiz__user=user` (traversal ORM, pas de `objects.all()`)

**4. Comportement par défaut (ZIP) préservé**
Le chemin ZIP existant est inchangé, il s'exécute uniquement si `format_param != "json"`.

**5. Mise à jour du décorateur `extend_schema`**
Description mise à jour pour mentionner les deux formats de réponse.

### Critères de sécurité validés
- Pas de `objects.all()` non filtré → isolation utilisateur garantie
- Le champ `role` n'est jamais exposé dans un sérialiseur public (assignation serveur uniquement)
- Rétrocompatibilité totale : le frontend existant (qui attend un ZIP) continue de fonctionner

---

## T-SEC-01r — Séparation system/user Ollama (`/api/chat`)

### Fichier modifié
- `backend/llm/services/ollama_client.py`

### Problème initial
`OllamaLLMClient._call_ollama()` appelait `/api/generate` avec un prompt unique résultant de la **concaténation** du prompt système et du contenu utilisateur via `build_full_prompt()`. Cette approche expose au risque d'injection de prompt (Prompt Injection) car il n'y a pas de frontière stricte entre les deux rôles.

### Modifications apportées

**1. Mise à jour de l'import**
```python
# Avant
from .quiz_prompt import build_full_prompt, parse_and_validate_quiz

# Après
from .quiz_prompt import SYSTEM_PROMPT, build_user_prompt, parse_and_validate_quiz
```
`build_full_prompt` (concaténation) retiré ; `SYSTEM_PROMPT` (constante) et `build_user_prompt` (message utilisateur seul) importés.

**2. Méthode `generate_quiz` simplifiée**
```python
# Avant
def generate_quiz(self, source_text: str, title: str) -> list[dict]:
    prompt = build_full_prompt(source_text, title)
    raw = self._call_ollama(prompt)
    return parse_and_validate_quiz(raw)

# Après
def generate_quiz(self, source_text: str, title: str) -> list[dict]:
    raw = self._call_ollama(SYSTEM_PROMPT, build_user_prompt(source_text, title))
    return parse_and_validate_quiz(raw)
```

**3. Méthode `_call_ollama` : endpoint et payload**
```python
# Avant : signature et appel
def _call_ollama(self, prompt: str) -> str:
    response = requests.post(
        f"{self.host}/api/generate",
        json={
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.4},
            "format": "json",
        },
        timeout=self.timeout,
    )

# Après : signature et appel
def _call_ollama(self, system_prompt: str, user_prompt: str) -> str:
    response = requests.post(
        f"{self.host}/api/chat",
        json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
            "options": {"temperature": 0.4},
            "format": "json",
        },
        timeout=self.timeout,
    )
```

**4. Extraction de la réponse**
```python
# Avant : /api/generate renvoie {"response": "..."}
raw = data.get("response", "")

# Après : /api/chat renvoie {"message": {"role": "assistant", "content": "..."}}
raw = data.get("message", {}).get("content", "")
```
L'usage de `.get("message", {}).get("content", "")` est défensif : si `message` est absent (erreur inattendue), on obtient `""` et le code lève `LLMError("Ollama a renvoyé une réponse vide.")` plutôt qu'une `KeyError` non gérée.

**5. Mise à jour de la docstring de classe**
```python
# Avant
class OllamaLLMClient(LLMClient):
    """Client HTTP minimal pour Ollama (/api/generate)."""

# Après
class OllamaLLMClient(LLMClient):
    """Client HTTP minimal pour Ollama (/api/chat)."""
```

### Garanties de non-régression
- La gestion des exceptions `requests.RequestException` (timeout, connexion refusée) est conservée intacte
- `parse_and_validate_quiz` continue de valider la sortie LLM — la qualité du parsing est inchangée
- `format: "json"` et `options.temperature` conservés

---

## Récapitulatif des fichiers modifiés

| Fichier | Type | Nature de la modification |
|---|---|---|
| `frontend/src/components/ProgressBar.tsx` | Frontend React | Constaté présent, statut mis à jour |
| `frontend/src/pages/UploadPage.tsx` | Frontend React | Constaté présent, statut mis à jour |
| `frontend/src/api/llm.ts` | Frontend TypeScript | Constaté présent, statut mis à jour |
| `backend/quizzes/views.py` | Backend Django | Constaté présent, statut mis à jour |
| `backend/quizzes/urls.py` | Backend Django | Constaté présent, statut mis à jour |
| `backend/llm/services/ollama_client.py` | Backend Python | **MODIFIÉ** — `/api/generate` → `/api/chat` |
| `backend/accounts/views.py` | Backend Python | **MODIFIÉ** — Ajout branche `?format=json` |
| `docs/J4/tasks/TOUFIK_Frederick_T23-2_*.md` | Documentation | Statut `To Do` → `Done`, DoD cochée |
| `docs/J4/tasks/TOUFIK_Frederick_T23-3_*.md` | Documentation | Statut `To Do` → `Done`, DoD cochée |
| `docs/J4/tasks/TOUFIK_Frederick_TJ3B-4_*.md` | Documentation | Statut `Todo` → `Done`, DoD cochée |
| `docs/J4/tasks/TOUFIK_Frederick_TSEC-01r_*.md` | Documentation | Statut `Todo` → `Done`, DoD cochée |
