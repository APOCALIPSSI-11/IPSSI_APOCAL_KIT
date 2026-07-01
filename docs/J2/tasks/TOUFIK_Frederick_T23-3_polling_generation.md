# T-23.3 — Mécanisme de Polling client toutes les 5 secondes

> **User Story** : US-23 — *En tant que Léa, je veux voir une progression visuelle de la génération du quiz afin de savoir que le système travaille et d'estimer le temps d'attente.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter un mécanisme de rafraîchissement périodique (polling) toutes les 5 secondes côté frontend pour suivre la génération asynchrone du quiz. 

Pour éviter les timeouts HTTP (les passerelles web coupant généralement les requêtes au-delà de 30 ou 60 secondes), l'application bascule sur un flux de traitement asynchrone : l'API backend crée instantanément l'entité quiz à l'état de génération et libère la connexion HTTP. Le frontend interroge ensuite régulièrement le statut du quiz jusqu'à ce que la génération soit finalisée.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | API Django de génération | **OUI** (rendre asynchrone / ajouter un endpoint de statut) |
| [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx) | Page d'upload et attente | **OUI** (lancement de la boucle de polling) |
| `frontend/src/api/llm.ts` | Client d'appel API | **OUI** (ajouter la fonction de polling) |

---

## 3. Spécifications techniques

### 3.1 Modification du protocole d'échange backend/frontend
- **Soumission initiale** : `POST /api/quizzes/generate/`
  - Le backend initie la tâche de génération en arrière-plan (par exemple via un thread séparé ou une queue de tâche comme Celery).
  - Le backend retourne immédiatement un statut `202 ACCEPTED` avec l'objet quiz contenant `"status": "generating"` et `"id": quiz_id`.
- **Bascule client** : Le frontend intercepte le code `202`, affiche l'écran de chargement, et démarre une boucle d'interrogation.
- **Requête de Polling** : `GET /api/quizzes/<id>/status/`
  - Le backend renvoie le statut courant du quiz :
    - `{ "status": "generating" }`
    - `{ "status": "completed" }`
    - `{ "status": "failed", "error": "Message d'erreur" }`

### 3.2 Implémentation du Polling dans React
Utiliser les hooks `useState` et `useEffect` combinés à un `setInterval` :
- Dès que le mode asynchrone est enclenché, un `setInterval` s'exécute toutes les 5000 ms.
- Chaque tick de l'intervalle interroge le endpoint de statut du quiz.
- **Conditions d'arrêt** :
  - Si le statut est `"completed"` : Effacer l'intervalle, rediriger vers `/quiz/${id}`.
  - Si le statut est `"failed"` : Effacer l'intervalle, stopper le chargement, afficher le message d'erreur.
  - Si l'appel d'API réseau échoue à plusieurs reprises : Stopper la boucle et lever une alerte de timeout réseau.

---

## 4. Étapes détaillées

### Étape 1 — Créer le endpoint de vérification de statut (Backend)
Dans `backend/quizzes/views.py`, ajouter une vue de statut :
```python
class QuizStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        quiz = get_object_or_404(Quiz, pk=pk, user=request.user)
        # Supposons qu'un champ 'status' ou la présence de questions indique l'état
        if quiz.questions.count() == 10:
            return Response({"status": "completed"})
        return Response({"status": "generating"})
```

### Étape 2 — Implémenter la fonction d'interrogation (Frontend)
Dans `frontend/src/api/llm.ts`, ajouter l'appel API :
```typescript
export async function getQuizStatus(quizId: number): Promise<{ status: 'generating' | 'completed' | 'failed' }> {
  const { data } = await api.get(`/quizzes/${quizId}/status/`);
  return data;
}
```

### Étape 3 — Coder la boucle de polling dans la page d'upload
Modifier `UploadPage.tsx` pour lancer le polling après réception du quiz asynchrone :
```typescript
const pollQuizStatus = (quizId: number) => {
  const intervalId = setInterval(async () => {
    try {
      const res = await getQuizStatus(quizId);
      if (res.status === 'completed') {
        clearInterval(intervalId);
        navigate(`/quiz/${quizId}`);
      } else if (res.status === 'failed') {
        clearInterval(intervalId);
        setError("La génération a échoué côté serveur.");
        setLoading(false);
      }
    } catch (err) {
      // Tolérer quelques échecs réseau temporaires avant de tout couper
      console.warn("Échec temporaire du polling", err);
    }
  }, 5000);
  
  // Nettoyer l'intervalle si le composant est démonté
  return () => clearInterval(intervalId);
};
```

---

## 5. Definition of Done

- [ ] L'API de statut `/api/quizzes/<id>/status/` est disponible et retourne l'état actuel de la génération.
- [ ] Le frontend interroge l'API réseau à intervalle régulier de 5 secondes.
- [ ] La boucle de polling s'arrête immédiatement lorsque le quiz est prêt ou en échec.
- [ ] Les compteurs d'intervalles sont nettoyés lors du démontage du composant React pour éviter les fuites de mémoire.

---

## 6. Pièges à éviter

1. **Accumulation d'intervalles** : Veiller à sauvegarder l'identifiant de l'intervalle retourné par `setInterval` et à appeler `clearInterval` lors de l'arrêt de la génération ou si l'utilisateur quitte la page.
2. **Timeout infini** : Mettre en place un garde-fou (par exemple un compteur maximum de 120 ticks, soit 10 minutes) pour arrêter automatiquement le polling si la génération stagne indéfiniment à l'état `"generating"` à la suite d'un crash silencieux du serveur Ollama.
