# TJ2.4 — Rédaction du guide d'installation client on-premise et procédure de rollback

> **Perturbation** : J2 — Technique (Latence inacceptable de génération)
> **Sprint** : Sprint 1 / Résolution Perturbation J2
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK + Seer MENSAH ASSIAKOLEY + Thi Van Anh NGUYEN 
> **Statut** : Todo (Planifié pour Sprint 2)

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de rédiger la documentation technique et les scripts d'installation pour la livraison du produit EduTutor IA en licence on-premise chez les établissements clients (Phase 3). 

Cette documentation doit fournir des instructions claires pour déployer la stack applicative Docker complète, pré-charger les poids du modèle LLM local sélectionné (`llama3.2:3b`) pour éviter le téléchargement internet, et décrire la procédure de rollback immédiat vers le modèle d'origine en cas de problème.

---

## 2. Contexte du code actuel

| Fichier / Dossier | Rôle | À créer / modifier ? |
|---|---|---|
| `docs/on-premise/install.md` | Guide d'installation pas-à-pas destiné aux administrateurs client | **NEW** (ou squelette) |
| `docs/on-premise/prerequisites.md` | Fiche technique des prérequis matériels | **NEW** (ou squelette) |
| `scripts/install.sh` | Script d'installation automatisé Linux | **NEW** |
| `scripts/install.ps1` | Script d'installation automatisé Windows | **NEW** |

---

## 3. Spécifications techniques

### 3.1 Structure du pack de livraison
Le produit est livré sous forme d'une archive compressée contenant :
- `docker-compose.yml` : Configuration des conteneurs (backend, frontend, postgres, ollama).
- `.env.example` : Variables d'environnement de base.
- `models/llama3.2_3b.tar` : Sauvegarde locale des poids du modèle.
- `scripts/install.sh` / `install.ps1` : Scripts d'automatisation.
- `docs/` : Guides au format Markdown.

### 3.2 Script d'installation automatique (`install.sh` / `install.ps1`)
Le script d'installation doit automatiser les étapes d'initialisation :
1. Vérifier que Docker et Docker Compose sont installés sur le serveur.
2. Importer localement les poids du modèle LLM sans nécessiter d'accès internet :
   ```bash
   # Importer le fichier tar des poids dans le répertoire d'Ollama
   docker compose run --rm ollama ollama create llama3.2:3b -f /models/Modelfile
   ```
3. Générer le fichier `.env` avec des clés d'API et mots de passe aléatoires sécurisés.
4. Lancer la stack complète : `docker compose up -d`.
5. Exécuter un healthcheck interne pour valider que tous les conteneurs répondent.

### 3.3 Procédure de Rollback (Retour arrière)
Si le client constate des hallucinations trop fréquentes sur le modèle 3B et exige un retour au modèle initial 8B (`llama3.1:8b`), la procédure doit être entièrement documentée et simple à exécuter :
1. Modifier le fichier `.env` de production :
   ```diff
   - OLLAMA_MODEL=llama3.2:3b
   + OLLAMA_MODEL=llama3.1:8b
   ```
2. Télécharger le modèle d'origine (si non présent en cache) :
   ```bash
   docker compose exec ollama ollama pull llama3.1:8b
   ```
3. Redémarrer le conteneur du backend :
   ```bash
   docker compose restart backend
   ```
Durée totale de l'opération : moins de 2 minutes (si le modèle est en cache), sans perte de données.

---

## 4. Étapes détaillées

### Étape 1 — Rédiger le guide de prérequis
Créer le fichier `docs/on-premise/prerequisites.md` récapitulant les profils de matériels par tier d'établissement (Standard, Pro, Enterprise) avec les quantités de RAM, processeurs et options de cartes graphiques requises pour faire tourner les modèles.

### Étape 2 — Écrire le script d'installation automatisé
Développer un script shell simple `scripts/install.sh` qui valide l'existence des conteneurs, configure les permissions de dossiers de base de données PostgreSQL, et initialise le modèle LLM local.

### Étape 3 — Rédiger le guide d'exploitation et de rollback
Créer le fichier `docs/on-premise/install.md` détaillant les étapes pas-à-pas de premier lancement ainsi que les commandes de maintenance courantes (sauvegardes postgres, vérification de logs, et procédure de rollback).

---

## 5. Definition of Done

- [ ] La structure de fichiers du pack de livraison on-premise est définie et documentée.
- [ ] Le guide d'installation `install.md` et les prérequis `prerequisites.md` sont rédigés.
- [ ] Le script d'installation automatique vérifie les dépendances système et charge le modèle local.
- [ ] La procédure de rollback de modèle est documentée, testée et validée (réversibilité complète < 2 minutes).

---

## 6. Pièges à éviter

1. **Dépendance à internet lors du pull** : Les serveurs des lycées ou universités clientes peuvent être situés derrière des proxies restrictifs ou ne posséder aucun accès à internet (environnement isolé "air-gapped"). S'assurer que le script charge le modèle à partir du fichier `.tar` fourni localement dans l'archive et ne tente pas de faire un appel HTTP `ollama pull` vers les serveurs externes d'Ollama.
2. **Droits super-utilisateur (sudo)** : Le script d'installation doit vérifier au démarrage qu'il possède les droits d'administration nécessaires pour interagir avec le démon Docker.
3. **Mots de passe en dur** : Ne jamais livrer un fichier `.env` contenant des mots de passe PostgreSQL ou des clés de sécurité Django par défaut en dur. Le script d'installation doit les générer de manière aléatoire et unique pour chaque client lors de l'installation.
