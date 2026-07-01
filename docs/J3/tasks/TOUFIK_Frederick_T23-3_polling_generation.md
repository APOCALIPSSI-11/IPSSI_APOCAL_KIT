# T-23.3 — Polling / rafraîchissement toutes les 5 secondes

> **User Story** : US-23 — *En tant que Léa, je veux voir une progression visuelle de la génération du quiz afin de savoir que le système travaille et d'estimer le temps d'attente.*
> **Sprint** : Sprint 2
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : To Do

---

## 1. Objectif de la tâche

Implémenter un mécanisme de polling côté frontend qui interroge le backend toutes les 5 secondes pour suivre l'état de génération d'un quiz. L'objectif est d'éviter les timeouts HTTP sur les passerelles web (qui coupent généralement les connexions au-delà de 30-60 s) en basculant vers un flux asynchrone : le backend crée le quiz immédiatement (`202 ACCEPTED`) et libère la connexion ; le frontend interroge ensuite l'endpoint de statut jusqu'à complétion.

**Dépendance** : T-23.2 (cette même session) — le polling s'appuie sur `ProgressBar` pour afficher l'attente pendant les intervalles.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Vues de gestion des quizzes | **OUI** (ajouter `QuizStatusView`) |
| [backend/quizzes/urls.py](../../../backend/quizzes/urls.py) | Routage des quizzes | **OUI** (enregistrer la route de statut) |
| [frontend/src/api/llm.ts](../../../frontend/src/api/llm.ts) | Client d'appel API LLM | **OUI** (ajouter `getQuizStatus`) |
| [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx) | Page d'upload — gère déjà `loading` et `navigate` | **OUI** (lancer la boucle de polling après `202`) |

---

## 3. Spécifications techniques

### 3.1 Nouveau protocole d'échange backend → frontend

| Étape | Action |
|---|---|
| **Soumission** | `POST /api/llm/generate-quiz/` — le backend initie la génération en arrière-plan et retourne immédiatement `202 ACCEPTED` avec `{ "id": quiz_id, "status": "generating" }` |
| **Polling** | `GET /api/quizzes/<id>/status/` — retourne `{ "status": "generating" \| "completed" \| "failed" }` |
| **Fin** | Si `completed` → redirect `/quiz/<id>`. Si `failed` → afficher erreur. |

### 3.2 Endpoint backend `QuizStatusView`

Dans `backend/quizzes/views.py` :

```python
class QuizStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        quiz = get_object_or_404(Quiz, pk=pk, user=request.user)
        # Heuristique : quiz complet si et seulement si 10 questions existent
        if quiz.questions.count() == 10:
            return Response({"status": "completed"})
        return Response({"status": "generating"})
```

Route à enregistrer dans `backend/quizzes/urls.py` :
```python
path("<int:pk>/status/", QuizStatusView.as_view(), name="quiz-status"),
```

### 3.3 Fonction de polling côté frontend

Dans `frontend/src/api/llm.ts` :

```typescript
export async function getQuizStatus(
  quizId: number
): Promise<{ status: 'generating' | 'completed' | 'failed' }> {
  const { data } = await api.get(`/quizzes/${quizId}/status/`);
  return data;
}
```

### 3.4 Boucle de polling dans `UploadPage.tsx`

```typescript
const pollQuizStatus = (quizId: number) => {
  let failCount = 0;
  const MAX_FAILS = 5;
  const MAX_TICKS = 120; // garde-fou : 10 min max (120 × 5 s)
  let ticks = 0;

  const intervalId = setInterval(async () => {
    ticks++;
    if (ticks > MAX_TICKS) {
      clearInterval(intervalId);
      setError('Timeout : la génération a pris trop de temps. Réessayez.');
      setLoading(false);
      return;
    }
    try {
      const res = await getQuizStatus(quizId);
      failCount = 0;
      if (res.status === 'completed') {
        clearInterval(intervalId);
        navigate(`/quiz/${quizId}`);
      } else if (res.status === 'failed') {
        clearInterval(intervalId);
        setError('La génération a échoué côté serveur.');
        setLoading(false);
      }
    } catch {
      failCount++;
      if (failCount >= MAX_FAILS) {
        clearInterval(intervalId);
        setError('Connexion perdue pendant la génération.');
        setLoading(false);
      }
    }
  }, 5000);

  return () => clearInterval(intervalId);
};
```

Adapter `handleSubmit` pour intercepter le `202` et déclencher le polling :
```typescript
const quiz = await generateQuiz({ ... }); // retourne { id, status: 'generating' } si 202
if (quiz.status === 'generating') {
  pollQuizStatus(quiz.id);
} else {
  navigate(`/quiz/${quiz.id}`);
}
```

---

## 4. Étapes détaillées

### Étape 1 — Créer l'endpoint de statut (Backend)
Dans `backend/quizzes/views.py`, ajouter `QuizStatusView`. Dans `backend/quizzes/urls.py`, enregistrer la route `<int:pk>/status/`.

### Étape 2 — Ajouter la fonction `getQuizStatus` (Frontend)
Dans `frontend/src/api/llm.ts`, ajouter la fonction qui appelle `GET /quizzes/<id>/status/`.

### Étape 3 — Câbler la boucle de polling dans UploadPage
Modifier `handleSubmit` dans `UploadPage.tsx` pour détecter le `202` et lancer `pollQuizStatus`. S'assurer que le `clearInterval` est appelé dans le `useEffect` de nettoyage du composant.

---

## 5. Definition of Done

- [ ] `GET /api/quizzes/<id>/status/` est fonctionnel et sécurisé (`IsAuthenticated`, filtre `user=request.user`).
- [ ] Le frontend interroge ce endpoint toutes les 5 secondes pendant la génération.
- [ ] La boucle s'arrête et redirige vers `/quiz/<id>` dès `status: "completed"`.
- [ ] La boucle s'arrête et affiche une erreur dès `status: "failed"` ou après 5 échecs réseau consécutifs.
- [ ] Un garde-fou de 120 ticks (10 min) coupe la boucle en cas de crash silencieux Ollama.
- [ ] Pas de fuite mémoire : `clearInterval` appelé lors du démontage du composant.

---

## 6. Pièges à éviter

1. **Accumulation d'intervalles** : Si `pollQuizStatus` est appelé plusieurs fois (double clic ou re-render), plusieurs `setInterval` tournent en parallèle. Stocker l'`intervalId` dans un `useRef` (pas un `useState`) pour le nettoyer proprement sans déclencher de re-render.
2. **Timeout infini** : Sans le garde-fou `MAX_TICKS`, si Ollama crashe silencieusement après avoir créé le quiz, la boucle tourne indéfiniment et consomme la batterie + les crédits API. Toujours limiter à 120 ticks.
3. **Droits d'accès sur le status endpoint** : Toujours filtrer avec `user=request.user` dans `QuizStatusView.get()`. Sans ce filtre, un utilisateur pourrait sonder le statut du quiz d'un autre utilisateur en bruteforçant les IDs.
