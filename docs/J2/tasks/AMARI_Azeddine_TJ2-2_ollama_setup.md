# TJ2.2 — Déploiement et préparation des modèles sur Ollama local

> **Perturbation** : J2 — Technique (Latence inacceptable de génération)
> **Sprint** : Sprint 1 / Résolution Perturbation J2
> **Estimation** : 30 min
> **Assigné** : Azzedine AMARI
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'installer et de configurer l'instance Ollama de développement ou de production pour télécharger (pull) et héberger localement le modèle choisi lors du benchmark (`llama3.2:3b` pour le tier Standard et `gemma4:31b` pour le tier Pro). 

Cette étape garantit que le modèle est pré-chargé en mémoire locale et disponible hors-ligne pour la génération souveraine de QCM.

---

## 2. Contexte du code actuel

| Fichier / Service | Rôle | À modifier / exécuter ? |
|---|---|---|
| Service Docker `ollama` | Conteneur hébergeant l'inférence LLM locale | **OUI** (téléchargement du modèle) |
| [docker-compose.yml](../../../docker-compose.yml) | Orchestration des conteneurs de développement | Non |

---

## 3. Spécifications techniques

### 3.1 Prérequis matériels par tier
- **Tier Standard** (Modèle `llama3.2:3b`) :
  - RAM minimum : 8 Go (16 Go recommandé).
  - CPU : 4 à 8 cœurs.
  - Espace disque requis : ~2.0 Go pour les poids du modèle.
- **Tier Pro / Enterprise** (Modèle `gemma4:31b` ou `gpt-oss:20b`) :
  - RAM minimum : 32 Go.
  - GPU recommandé : NVIDIA RTX 4070 ou supérieure avec au moins 16 Go de VRAM (idéalement RTX 4090 24 Go).
  - Espace disque requis : ~18 Go pour `gemma4:31b` et ~12 Go pour `gpt-oss:20b`.

### 3.2 Commande de téléchargement (Pull)
Pour télécharger les modèles au sein du service Ollama lancé par Docker Compose :
```bash
# Téléchargement du modèle Standard 3B
docker compose exec ollama ollama pull llama3.2:3b

# Téléchargement du modèle Pro Premium 31B
docker compose exec ollama ollama pull gemma4:31b
```

### 3.3 Vérification des modèles locaux
La commande `ollama list` permet de valider la présence et la taille des modèles téléchargés :
```bash
docker compose exec ollama ollama list
```
Sortie attendue :
```
NAME            ID              SIZE      MODIFIED
llama3.2:3b     a80c291249b6    2.0 GB    1 minute ago
gemma4:31b      f19f201099b2    18 GB     5 minutes ago
```

---

## 4. Étapes détaillées

### Étape 1 — Démarrer le service Ollama
S'assurer que la stack Docker Compose de base est en cours d'exécution :
```bash
docker compose up -d ollama
```

### Étape 2 — Lancer le téléchargement du modèle cible
Exécuter la commande `ollama pull llama3.2:3b` pour le modèle de base. Le téléchargement peut prendre de 1 à 10 minutes selon la vitesse de la connexion internet.

### Étape 3 — Effectuer un test de préchauffage (Warmup)
Le premier appel à un modèle Ollama implique de charger ses poids depuis le stockage disque vers la mémoire RAM/VRAM. Ce chargement initial peut rajouter de 10 à 30 secondes de latence. Pour éviter que le premier utilisateur ne subisse ce délai, lancer une requête de test "à blanc" au démarrage du serveur :
```bash
docker compose exec ollama ollama run llama3.2:3b "Génère un bonjour"
```

---

## 5. Definition of Done

- [ ] Le service `ollama` est actif dans Docker Compose.
- [ ] Le modèle `llama3.2:3b` est listé par la commande `ollama list`.
- [ ] Le premier appel à blanc est complété avec succès.
- [ ] L'espace disque sur l'hôte est suffisant pour stocker les modèles (au moins 20 Go disponibles).

---

## 6. Pièges à éviter

1. **Volume Docker non persistant** : Par défaut, si le conteneur Ollama est supprimé (`docker compose down`), les modèles téléchargés peuvent être perdus. S'assurer que le fichier `docker compose` mappe un volume persistant sur l'hôte (ex: `ollama_data:/root/.ollama`) pour éviter d'avoir à télécharger les ~2 Go de modèle à chaque redémarrage de la stack.
2. **Saturation de la VRAM (GPU)** : Si vous faites tourner plusieurs modèles en parallèle, Ollama peut saturer la VRAM de votre carte graphique et basculer silencieusement sur le processeur (CPU), multipliant la latence par 5 à 10. Toujours vérifier la VRAM disponible avec la commande `nvidia-smi` sous Windows/Linux.
