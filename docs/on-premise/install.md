# Guide d'installation on-premise — EduTutor IA

> **Tâche** : [TJ2.4](../J2/tasks/TOUFIK_Frederick_MENSAH-ASSIAKOLEY_Seer_NGUYEN_Thi_Van_Anh_TJ2-4_on_premise_doc.md)
> **Public** : administrateur système de l'établissement client
> **Prérequis matériels** : voir [prerequisites.md](./prerequisites.md)
> **Décision architecture LLM** : [ADR-0001](../adr/ADR-001-choix-llm.md)

Ce guide couvre l'installation complète d'EduTutor IA en licence
on-premise (auto-hébergée chez le client), y compris pour les sites
**sans accès Internet** ("air-gapped") : aucune étape de ce guide ne
nécessite de connexion sortante en fonctionnement normal.

---

## 1. Structure du pack de livraison

L'archive livrée au client contient :

```
edututor-onpremise/
├── docker-compose.yml            # Stack de base (postgres, ollama, backend, frontend)
├── docker-compose.prod.yml       # Override production (gunicorn, build statique, healthchecks)
├── docker-compose.onpremise.yml  # Override on-premise (Ollama toujours actif + montage des poids locaux)
├── .env.prod.example             # Modèle de configuration (sans secret réel)
├── models/                       # Poids LLM PRÉ-TÉLÉCHARGÉS, un sous-dossier par tier
│   ├── standard-llama3.2-3b/
│   ├── pro-gpt-oss-20b/
│   └── enterprise-gemma-4-31b-it/
├── scripts/
│   ├── install.sh                # Installation automatisée (Linux)
│   └── install.ps1               # Installation automatisée (Windows)
├── backend/, frontend/, docker/  # Code source + Dockerfiles
└── docs/on-premise/              # Ce guide + prerequisites.md
```

Le tier (Standard / Pro / Enterprise) détermine quel sous-dossier de
`models/` est utilisé — voir [prerequisites.md](./prerequisites.md) pour le
mapping tier ↔ matériel ↔ modèle.

---

## 2. Premier lancement

### Linux

```bash
sudo bash scripts/install.sh --tier=standard   # ou --tier=pro / --tier=enterprise
```

### Windows

Dans un PowerShell **« Exécuter en tant qu'administrateur »** :

```powershell
.\scripts\install.ps1 -Tier standard   # ou -Tier pro / -Tier enterprise
```

Le script automatise, dans l'ordre :

1. Vérification des droits d'administration nécessaires au démon Docker.
2. Vérification de la présence de Docker + Docker Compose v2.
3. Vérification que les poids du modèle du tier choisi sont bien présents localement dans `models/<tier>/` — **aucun `ollama pull` réseau n'est jamais déclenché**.
4. Génération d'un `.env` avec des secrets aléatoires (`DJANGO_SECRET_KEY`, mot de passe PostgreSQL) si absent — jamais de mot de passe en dur.
5. Import local du modèle dans Ollama (`ollama create -f Modelfile`).
6. Démarrage de la stack complète (`docker compose up -d --build`).
7. Healthcheck interne : PostgreSQL (`pg_isready`), Ollama (`ollama list`), backend (`GET /health/`).

En sortie, le script affiche `[OK]`/`[ECHEC]` pour chacun des 3 services. En
cas d'échec, consultez `docker compose logs -f`.

### Relancer l'import d'un autre tier

Pour changer de tier après une première installation (ex. upgrade Standard →
Pro suite à l'ajout d'un GPU), relancez le script avec le nouveau `--tier` :
il détecte que `.env` existe déjà (ne régénère pas les secrets), mais importe
le nouveau modèle et met à jour `OLLAMA_MODEL` — attention, dans ce cas
supprimez d'abord la ligne `OLLAMA_MODEL` du `.env` existant ou éditez-la à
la main, le script ne réécrit pas un `.env` déjà présent (cf. §4 du guide).

---

## 3. Commandes de maintenance courante

### Vérifier l'état des conteneurs

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.onpremise.yml ps
```

### Consulter les logs

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.onpremise.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.onpremise.yml logs -f ollama
```

### Sauvegarder la base PostgreSQL

```bash
docker compose exec -T postgres pg_dump -U apocal apocal > backup-$(date +%Y%m%d-%H%M).sql
```

### Restaurer une sauvegarde

```bash
cat backup-20260701-1200.sql | docker compose exec -T postgres psql -U apocal apocal
```

### Vérifier les modèles Ollama installés

```bash
docker compose exec ollama ollama list
```

---

## 4. Procédure de rollback (retour au modèle d'origine)

Si le client constate des hallucinations trop fréquentes ou une qualité
insuffisante sur le modèle installé, retour possible vers `llama3.1:8b`
(baseline connue, cf. [ADR-0001](../adr/ADR-001-choix-llm.md)) en **moins de
2 minutes** :

1. **Modifier le `.env` de production** :

   ```diff
   - OLLAMA_MODEL=llama3.2:3b
   + OLLAMA_MODEL=llama3.1:8b
   ```

2. **Importer le modèle de repli** — deux cas :

   - **Site connecté à Internet** :
     ```bash
     docker compose exec ollama ollama pull llama3.1:8b
     ```
   - **Site air-gapped** : le modèle `llama3.1:8b` doit être présent en
     cache (soit déjà importé lors d'une précédente installation, soit
     livré en avance dans un dossier `models/rollback-llama3.1-8b/` — à
     inclure dans l'archive de livraison si un rollback est anticipé pour ce
     client). Import identique aux autres tiers :
     ```bash
     docker compose exec ollama ollama create llama3.1:8b -f /models/rollback-llama3.1-8b/Modelfile
     ```
     ⚠️ Sans ce cache local, un site réellement air-gapped **ne peut pas**
     effectuer ce rollback en < 2 minutes — c'est un point à valider avec le
     client au moment de la vente (cf. piège #1 ci-dessous).

3. **Redémarrer le conteneur backend** :

   ```bash
   docker compose restart backend
   ```

Durée totale : moins de 2 minutes si le modèle est déjà en cache local,
sans perte de données (PostgreSQL n'est pas touché par cette procédure).

---

## 5. Dépannage

| Symptôme | Cause probable | Action |
|---|---|---|
| `install.sh`/`install.ps1` échoue à l'étape droits admin | Utilisateur hors groupe `docker` / session non-admin | `sudo usermod -aG docker $USER` (Linux) ou relancer PowerShell en admin (Windows) |
| Échec « Modelfile introuvable » | Le pack de livraison ne contient pas les poids du tier demandé | Vérifier `models/<tier>/Modelfile`, voir [models/README.md](../../models/README.md) |
| Backend `[ECHEC]` au healthcheck | Migration DB en échec ou modèle LLM absent | `docker compose logs backend` |
| Génération de quiz trop lente sur tier Pro/Enterprise | GPU non détecté par le conteneur Ollama | Vérifier les drivers NVIDIA + `nvidia-container-toolkit`, décommenter la section `deploy.resources` dans `docker-compose.yml` |

---

## 6. Pièges à éviter (rappel)

1. **Ne jamais dépendre d'un accès Internet en fonctionnement normal.** Les
   scripts n'appellent `ollama pull` que dans la procédure de rollback si le
   modèle de repli n'est pas déjà en cache — jamais au premier démarrage.
2. **Droits d'administration Docker.** Vérifiés systématiquement en début de
   script, avant toute autre opération.
3. **Aucun mot de passe en dur.** `.env` n'est généré qu'une fois, avec des
   secrets aléatoires uniques par installation (`DJANGO_SECRET_KEY`,
   `POSTGRES_PASSWORD`) — jamais les valeurs de `.env.example`/`.env.prod.example`.
