#!/usr/bin/env bash
# ============================================================================
# install.sh — Installation on-premise EduTutor IA (client, Linux, air-gapped)
# ----------------------------------------------------------------------------
# TJ2.4 — cf. docs/on-premise/install.md et docs/on-premise/prerequisites.md
#
# Ce script :
#   1. Vérifie les droits d'administration nécessaires au démon Docker.
#   2. Vérifie que Docker + Docker Compose v2 sont installés.
#   3. Sélectionne le modèle LLM à importer selon le tier client (--tier).
#   4. Vérifie que les poids du modèle sont bien présents LOCALEMENT dans
#      models/<tier>/ (pack de livraison) — aucun accès Internet requis.
#   5. Génère un .env avec des secrets aléatoires si absent.
#   6. Importe le modèle dans Ollama via `ollama create` (jamais `ollama pull`).
#   7. Démarre la stack complète (postgres, ollama, backend, frontend).
#   8. Exécute un healthcheck interne sur les 3 services.
#
# Usage :
#   sudo bash scripts/install.sh --tier=standard   (défaut)
#   sudo bash scripts/install.sh --tier=pro
#   sudo bash scripts/install.sh --tier=enterprise
#
# Procédure de rollback : voir docs/on-premise/install.md §Rollback.
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

TIER="standard"
for arg in "$@"; do
  case "$arg" in
    --tier=*) TIER="${arg#--tier=}" ;;
    --help|-h)
      sed -n '2,25p' "$0"
      exit 0
      ;;
    *)
      echo "Option inconnue : $arg (voir --help)" >&2
      exit 1
      ;;
  esac
done

case "$TIER" in
  standard)   MODEL="llama3.2:3b";     MODEL_DIR="standard-llama3.2-3b" ;;
  pro)        MODEL="gpt-oss:20b";     MODEL_DIR="pro-gpt-oss-20b" ;;
  enterprise) MODEL="gemma4:31b";      MODEL_DIR="enterprise-gemma-4-31b-it" ;;
  *)
    echo "ERREUR : tier inconnu '${TIER}' (attendu : standard | pro | enterprise)" >&2
    exit 1
    ;;
esac

COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.onpremise.yml"
COMPOSE="docker compose ${COMPOSE_FILES} --profile ollama --profile edge"

echo "=== Installation EduTutor IA on-premise — tier '${TIER}' (modèle ${MODEL}) ==="
echo ""

# ---------------------------------------------------------------------------
# 1. Droits d'administration (piège #2 — le démon Docker exige des privilèges)
# ---------------------------------------------------------------------------
echo "==> [1/8] Vérification des droits d'administration Docker..."
if [ "$(id -u)" -ne 0 ] && ! groups "$(id -un)" | grep -qw docker; then
  echo "ERREUR : ce script doit être lancé avec des droits suffisants pour piloter Docker." >&2
  echo "  Solutions : relancez avec 'sudo bash scripts/install.sh ...'" >&2
  echo "  ou ajoutez votre utilisateur au groupe docker : sudo usermod -aG docker \$USER (puis reconnectez-vous)." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Docker + Docker Compose
# ---------------------------------------------------------------------------
echo "==> [2/8] Vérification de Docker et Docker Compose..."
if ! command -v docker >/dev/null 2>&1; then
  echo "ERREUR : Docker n'est pas installé. https://docs.docker.com/engine/install/" >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "ERREUR : le démon Docker ne répond pas (démarrez-le : sudo systemctl start docker)." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "ERREUR : 'docker compose' (v2) introuvable. Mettez Docker à jour." >&2
  exit 1
fi
echo "    OK."

# ---------------------------------------------------------------------------
# 3/4. Poids du modèle présents localement (air-gapped — piège #1)
# ---------------------------------------------------------------------------
echo "==> [3/8] Vérification de la présence locale des poids du modèle (${MODEL})..."
MODEL_PATH="models/${MODEL_DIR}"
if [ ! -f "${MODEL_PATH}/Modelfile" ]; then
  echo "ERREUR : ${MODEL_PATH}/Modelfile introuvable." >&2
  echo "  Ce pack de livraison doit contenir les poids pré-téléchargés du modèle." >&2
  echo "  Voir models/README.md pour la procédure de préparation du pack." >&2
  echo "  Ce script n'effectue JAMAIS de 'ollama pull' réseau (site potentiellement air-gapped)." >&2
  exit 1
fi
echo "    OK (${MODEL_PATH}/Modelfile présent)."

# ---------------------------------------------------------------------------
# 5. Génération du .env (secrets aléatoires, jamais de mot de passe en dur)
# ---------------------------------------------------------------------------
echo "==> [4/8] Configuration de l'environnement (.env)..."
if [ -f .env ]; then
  echo "    .env déjà présent : conservé tel quel (secrets non régénérés)."
else
  cp .env.prod.example .env
  DJANGO_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  PG_PASSWORD="$(openssl rand -base64 24 | tr -d '\n/+=')"
  # Séparateur alternatif (#) car les secrets générés peuvent contenir '/'.
  sed -i "s#^DJANGO_SECRET_KEY=.*#DJANGO_SECRET_KEY=${DJANGO_SECRET}#" .env
  sed -i "s#^POSTGRES_PASSWORD=.*#POSTGRES_PASSWORD=${PG_PASSWORD}#" .env
  sed -i "s#^LLM_BACKEND=.*#LLM_BACKEND=ollama#" .env
  sed -i "s#^OLLAMA_MODEL=.*#OLLAMA_MODEL=${MODEL}#" .env
  chmod 600 .env
  echo "    .env généré avec des secrets aléatoires uniques (DJANGO_SECRET_KEY, POSTGRES_PASSWORD)."
fi

# ---------------------------------------------------------------------------
# 6. Import local du modèle dans Ollama (jamais 'ollama pull')
# ---------------------------------------------------------------------------
echo "==> [5/8] Démarrage de postgres + ollama (préparation import modèle)..."
$COMPOSE up -d postgres ollama

echo "==> [6/8] Import local du modèle ${MODEL} dans Ollama..."
if $COMPOSE exec -T ollama ollama list 2>/dev/null | awk '{print $1}' | grep -qx "${MODEL}"; then
  echo "    Modèle ${MODEL} déjà importé, étape ignorée."
else
  $COMPOSE exec -T ollama ollama create "${MODEL}" -f "/models/${MODEL_DIR}/Modelfile"
  echo "    Modèle ${MODEL} importé avec succès (100% local, aucun accès réseau)."
fi

# ---------------------------------------------------------------------------
# 7. Démarrage de la stack complète
# ---------------------------------------------------------------------------
echo "==> [7/8] Démarrage de la stack complète (backend, frontend)..."
$COMPOSE up -d --build

# ---------------------------------------------------------------------------
# 8. Healthcheck interne
# ---------------------------------------------------------------------------
echo "==> [8/8] Healthcheck interne des services..."
sleep 5

FAIL=0

PG_USER="$(sed -n 's/^[[:space:]]*POSTGRES_USER[[:space:]]*=[[:space:]]*//p' .env | head -n1)"
PG_USER="${PG_USER:-apocal}"

if $COMPOSE exec -T postgres pg_isready -U "${PG_USER}" >/dev/null 2>&1; then
  echo "    [OK] postgres"
else
  echo "    [ECHEC] postgres ne répond pas." >&2
  FAIL=1
fi

if $COMPOSE exec -T ollama ollama list >/dev/null 2>&1; then
  echo "    [OK] ollama"
else
  echo "    [ECHEC] ollama ne répond pas." >&2
  FAIL=1
fi

if command -v curl >/dev/null 2>&1; then
  backend_ok=0
  for _ in $(seq 1 30); do
    if curl -s --max-time 3 -o /dev/null "http://localhost:8000/health/"; then
      backend_ok=1
      break
    fi
    sleep 2
  done
  if [ "$backend_ok" -eq 1 ]; then
    echo "    [OK] backend (http://localhost:8000/health/)"
  else
    echo "    [ECHEC] backend ne répond pas après 60s." >&2
    FAIL=1
  fi
else
  echo "    [IGNORE] curl absent, healthcheck backend non vérifié."
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "=== Installation terminée avec succès (tier ${TIER}, modèle ${MODEL}) ==="
  echo "Voir docs/on-premise/install.md pour les commandes de maintenance et la procédure de rollback."
else
  echo "=== Installation terminée AVEC ERREURS — voir ci-dessus. ===" >&2
  echo "Diagnostic : ${COMPOSE} logs -f" >&2
  exit 1
fi
