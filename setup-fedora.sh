#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# NBs SMP — Fedora KDE Server Setup & Deployment Script (Minecraft 26.3 Fabric)
# ==============================================================================
# Usage:
#   bash setup-fedora.sh [PATH_TO_MINECRAFT_SERVER_DIR]
# Example:
#   bash setup-fedora.sh ~/mc-server
# ==============================================================================

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MC_DIR="${1:-$HOME/mc-server}"
WORLD_NAME="${WORLD_NAME:-world}"

echo "========================================================"
echo "  NBs SMP Server Setup (Fedora KDE · Minecraft 26.3)"
echo "  Repo Dir      : $REPO_DIR"
echo "  Minecraft Dir : $MC_DIR"
echo "========================================================"

# 1. Check / Install system packages on Fedora
if command -v dnf >/dev/null 2>&1; then
  echo "[1/5] Checking Fedora packages (Java 21, jq, curl, podman)..."
  sudo dnf install -y java-21-openjdk-headless curl jq unzip podman podman-compose
fi

# Install Bun if missing
if ! command -v bun >/dev/null 2>&1; then
  echo "[1/5] Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

# 2. Prepare Minecraft Server directory & download Fabric 26.3 Mods
mkdir -p "$MC_DIR/mods"
mkdir -p "$MC_DIR/$WORLD_NAME/datapacks"

echo "[2/5] Installing Fabric 26.3 Performance & Vanilla+ Worldgen Mods into $MC_DIR/mods ..."
if [ -d "$REPO_DIR/mods" ] && [ -n "$(ls -A "$REPO_DIR/mods"/*.jar 2>/dev/null || true)" ]; then
  cp -f "$REPO_DIR/mods"/*.jar "$MC_DIR/mods/"
  echo "  -> Copied pre-downloaded .jar mods from $REPO_DIR/mods/"
else
  MOD_SLUGS=(
    "fabric-api"
    "lithium"
    "ferrite-core"
    "krypton"
    "moonrise-opt"
    "chunky"
    "spark"
    "geophilic"
    "dungeons-and-taverns"
  )
  for slug in "${MOD_SLUGS[@]}"; do
    echo "  -> Fetching latest 26.3 Fabric release for: $slug"
    api_url="https://api.modrinth.com/v2/project/${slug}/version?loaders=%5B%22fabric%22%5D&game_versions=%5B%2226.3%22%5D"
    json="$(curl -fsSL "$api_url")"
    dl_url="$(echo "$json" | jq -r '([.[] | select(.version_type == "release")][0] // .[0]).files[0].url')"
    fname="$(echo "$json" | jq -r '([.[] | select(.version_type == "release")][0] // .[0]).files[0].filename' | tr ' ' '-')"
    if [ -n "$dl_url" ] && [ "$dl_url" != "null" ]; then
      curl -fsSL "$dl_url" -o "$MC_DIR/mods/$fname"
      echo "     Saved: $MC_DIR/mods/$fname"
    else
      echo "     WARNING: Could not resolve 26.3 download URL for $slug"
    fi
  done
fi

# 3. Install NBS_Datapack & NBs_Worldgen into world/datapacks/
echo "[3/5] Installing NBS_Datapack & NBs_Worldgen into $MC_DIR/$WORLD_NAME/datapacks/ ..."
rm -rf "$MC_DIR/$WORLD_NAME/datapacks/NBS_Datapack"
mkdir -p "$MC_DIR/$WORLD_NAME/datapacks/NBS_Datapack"
cp -r "$REPO_DIR/pack.mcmeta" "$REPO_DIR/data" "$MC_DIR/$WORLD_NAME/datapacks/NBS_Datapack/"

if [ -d "$REPO_DIR/packs/NBs_Worldgen" ]; then
  rm -rf "$MC_DIR/$WORLD_NAME/datapacks/NBs_Worldgen"
  cp -r "$REPO_DIR/packs/NBs_Worldgen" "$MC_DIR/$WORLD_NAME/datapacks/NBs_Worldgen"
fi
echo "  -> Datapacks installed successfully."

# 4. Start PostgreSQL & Build Web Portal
echo "[4/5] Starting PostgreSQL & building NBs SMP Web Portal..."
cd "$REPO_DIR/web"

if command -v podman >/dev/null 2>&1; then
  podman compose up -d || true
elif command -v docker >/dev/null 2>&1; then
  docker compose up -d || true
fi

if [ ! -f "$REPO_DIR/web/.env" ]; then
  RAND_ADMIN="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 28 || echo 'nbs_admin_secret_token_2026_smp')"
  cat >"$REPO_DIR/web/.env" <<EOF
PORT=3000
APP_MODE=rcon
ADMIN_TOKEN=${RAND_ADMIN}
DATABASE_URL=postgres://nbs:nbs_secret_change_me@127.0.0.1:5432/nbs_smp
RCON_HOST=127.0.0.1
RCON_PORT=25575
RCON_PASSWORD=change_this_rcon_password
RCON_POLL_MS=3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
EOF
  echo "  -> Created $REPO_DIR/web/.env (Generated ADMIN_TOKEN=${RAND_ADMIN})"
  echo "  -> IMPORTANT: Set RCON_PASSWORD in web/.env to match rcon.password in server.properties!"
fi

bun install
bun run build:client

# 5. Open Fedora Firewall ports (25565 for Minecraft, 3000 for Web Portal)
if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  echo "[5/5] Opening firewalld ports 25565/tcp (Minecraft) and 3000/tcp (Web Portal)..."
  sudo firewall-cmd --permanent --add-port=25565/tcp || true
  sudo firewall-cmd --permanent --add-port=3000/tcp || true
  sudo firewall-cmd --reload || true
fi

echo ""
echo "========================================================"
echo "  Setup Complete!"
echo "  1. Check $MC_DIR/server.properties:"
echo "       enable-command-block=true"
echo "       function-permission-level=2"
echo "       enable-rcon=true"
echo "       rcon.port=25575"
echo "       rcon.password=<YOUR_RCON_PASSWORD>"
echo "  2. Update RCON_PASSWORD in $REPO_DIR/web/.env"
echo "  3. Start Web Portal: cd $REPO_DIR/web && bun run start"
echo "========================================================"
