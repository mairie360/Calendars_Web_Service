#!/usr/bin/env bash

COMPOSE_FILE="docker-compose-security.yml"
SERVICE_NAME="security-scan"

# Fresh Ed25519 key pair for this run (MAIR-680): Core signs the session JWTs with it, the other
# services only get the public key; ACCESS_TOKEN (sub=2, 4 hours) is signed like Core signs it.
# Nothing is committed.
# shellcheck source=stack_secrets.sh
source ./stack_secrets.sh || exit 1

echo "==> [1/4] Démarrage de la stack et lancement du scan ZAP..."
# TARGET_IMAGE (CI, MAIR-516): test the published front image instead of rebuilding it here.
# `up --build` would rebuild and retag it locally, so the build is skipped and the image pulled.
# The upstream images (core-api, database...) follow the moving stage tag and are pulled on every
# run (`pull_policy: ${UPSTREAM_PULL_POLICY:-always}`): to use a locally built CORE_API_IMAGE /
# DB_IMAGE override, run `UPSTREAM_PULL_POLICY=never ./security_test.sh` (MAIR-998).
if [ -n "${TARGET_IMAGE:-}" ]; then
  echo "Image sous test : $TARGET_IMAGE (pas de build local)."
  docker compose -f "$COMPOSE_FILE" up -d --no-build
else
  docker compose -f "$COMPOSE_FILE" up -d --build
fi
UP_EXIT_CODE=$?

echo "==> [2/4] Attente de la fin du scan de sécurité..."
docker compose -f "$COMPOSE_FILE" wait "$SERVICE_NAME"
EXIT_CODE=$?
# `compose wait` answers 0 when the service never started (a dependency failed at `up`):
# the run is then a failure, not a pass without findings.
if [ "$UP_EXIT_CODE" -ne 0 ]; then
  echo "La stack n'a pas démarré (docker compose up a échoué avec le code $UP_EXIT_CODE) : les logs des services suivent."
  docker compose -f "$COMPOSE_FILE" logs --no-color | grep -vE 'Running Changeset' | tail -60
  EXIT_CODE=1
fi

echo "==> [3/4] Affichage du rapport (logs)..."
docker compose -f "$COMPOSE_FILE" logs "$SERVICE_NAME"

echo "==> [4/4] Nettoyage des conteneurs..."
docker compose -f "$COMPOSE_FILE" down -v

echo "----------------------------------------"
echo "Code de sortie final : $EXIT_CODE"
echo "----------------------------------------"

exit $EXIT_CODE
