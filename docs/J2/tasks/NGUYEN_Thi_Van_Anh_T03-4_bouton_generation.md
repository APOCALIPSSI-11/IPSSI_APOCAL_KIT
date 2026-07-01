# T-03.4 — Intégration du bouton de génération et redirection

> **User Story** : US-03 — *En tant que Léa, je veux générer 10 questions à choix multiples à partir de mon cours afin de tester mes connaissances.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Thi Van Anh NGUYEN
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'intégrer le bouton de génération de quiz sur la page d'import de document (`UploadPage`) et d'assurer une transition fluide de l'utilisateur vers la page de jeu du quiz (`QuizPage`) à la fin de l'opération.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx) | Page d'importation de cours et soumission | **OUI** |
| `frontend/src/pages/QuizPage.tsx` | Page de visualisation et réponses du quiz | Non |

---

## 3. Spécifications techniques

### 3.1 Gestion d'état et transitions
Lors de la soumission du formulaire d'upload :
1. Positionner l'état de chargement `loading` à `true`.
2. Appeler la fonction asynchrone de génération de quiz en transmettant le cours extrait ou saisi.
3. Désactiver tous les champs d'entrées (inputs, switch de mode) et le bouton de soumission pendant la génération.
4. Une fois l'API de génération résolue avec succès, récupérer l'identifiant du quiz renvoyé (ex: `quiz.id`).
5. Utiliser `react-router-dom` pour rediriger l'utilisateur vers `/quiz/${quiz.id}`.
6. En cas d'erreur de génération, repasser `loading` à `false` et afficher l'erreur dans un bandeau d'alerte.

### 3.2 Expérience utilisateur (UX)
Le bouton de génération doit changer d'apparence de manière dynamique :
- **État inactif/prêt** : Affiche le libellé `"🚀 Générer le quiz"`.
- **État actif/chargement** : Affiche un indicateur d'attente (ex: `"Génération en cours…"`) avec un message d'explications sur le temps de traitement (1 à 5 min en inférence locale sur CPU).

---

## 4. Étapes détaillées

### Étape 1 — Mettre en place le bouton d'action et les états de verrouillage
Dans [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx), lier le bouton d'envoi du formulaire à la variable d'état `loading` :
```tsx
<button type="submit" disabled={loading} className="btn-primary w-full">
  {loading ? (
    <>
      <span className="animate-spin mr-2">⏳</span>
      Génération en cours… (ceci peut prendre 1 à 5 min)
    </>
  ) : (
    "🚀 Générer le quiz"
  )}
</button>
```

### Étape 2 — Implémenter le rappel de soumission et la redirection
Utiliser le hook `useNavigate` de `react-router-dom` :
```tsx
const navigate = useNavigate();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    const quiz = await generateQuiz({
      title,
      pdf: mode === 'pdf' ? pdf : undefined,
      source_text: mode === 'text' ? sourceText : undefined,
    });
    // Redirection vers l'identifiant de quiz retourné
    navigate(`/quiz/${quiz.id}`);
  } catch (err) {
    setError(getApiErrorMessage(err, "La génération a échoué. Veuillez réessayer."));
  } finally {
    setLoading(false);
  }
};
```

---

## 5. Definition of Done

- [x] Le bouton submit change de texte et affiche un spinner en cours de chargement.
- [x] Tous les champs du formulaire sont verrouillés (`disabled`) pendant la génération du quiz.
- [x] L'utilisateur est automatiquement redirigé vers l'URL `/quiz/:id` correspondante à la fin de la requête d'API.
- [x] Si la génération échoue, un message d'erreur est affiché sur la page d'upload et les champs redeviennent modifiables.

---

## 6. Pièges à éviter

1. **Permettre le double-clic** : Si le bouton submit n'est pas correctement désactivé pendant `loading === true`, un double clic de l'utilisateur enverra deux requêtes de génération en parallèle au backend. Cela doublera le temps de calcul sur le serveur Ollama et créera deux quiz doublons en base de données.
2. **Ignorer le timeout client** : Veiller à ce que la requête axios du frontend pour la génération ne se ferme pas prématurément par un timeout côté client (ex: après 30 s). La configuration HTTP globale d'Axios ou de Fetch doit supporter des requêtes d'au moins 10 minutes pour la génération locale.
