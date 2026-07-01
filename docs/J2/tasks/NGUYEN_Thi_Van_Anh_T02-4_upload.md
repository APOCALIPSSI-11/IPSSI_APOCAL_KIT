## Frontend — Page `/upload` (React + Tailwind)

La page `/upload` est le point d'entrée de la génération de quiz à partir d'un cours.  
Elle propose **deux méthodes exclusives**:

1. **Upload PDF** (fichier `<= 5 Mo`)
2. **Saisie texte** (contenu `>= 200 caractères`)

### Flux fonctionnel

1. L'utilisateur choisit une méthode (`PDF` ou `Texte`).
2. Le frontend applique une validation immédiate (taille/longueur).
3. Si valide, il construit une requête `multipart/form-data`.
4. Il appelle l'API Django (`POST /api/courses`).
5. Pendant le traitement local Ollama, l'UI affiche un état de chargement explicite.
6. À la réponse, le frontend redirige vers l'étape suivante (quiz/résultats) ou affiche une erreur métier.

### Contrat côté frontend

- **Validation client défensive**:
  - PDF: max 5 Mo
  - Texte: min 200 caractères
- **UX de latence**:
  - bouton “Générer” désactivé pendant requête
  - feedback visuel de progression/attente
- **Gestion d'erreur**:
  - message clair sur format invalide, taille excessive, timeout ou échec backend

### Notes d'architecture

- État local géré via `useState` (pas de store global au Sprint 1).
- Drag & Drop basé sur API HTML5 native (pas de dépendance `react-dropzone`).
- Les règles frontend reflètent les contraintes backend pour garantir la cohérence du flux.