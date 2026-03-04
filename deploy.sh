#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  deploy.sh — Despliegue automático de Fmatputes Dashboard
#  Dominio: fmatputes.lol  •  Cloudflare + Nginx Proxy Manager
#
#  USO:
#    chmod +x deploy.sh && sudo ./deploy.sh
# ══════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="fmatputes.lol"
REPO="https://github.com/RicardoMaas7/Fmatputes-Dashboard.git"
BRANCH="develop"
APP_DIR="$HOME/Fmatputes-Dashboard"
NPM_DIR="$HOME/nginx-proxy-manager"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }

# ── 0. Verificar root ──────────────────────────────────────
[[ $EUID -eq 0 ]] || err "Ejecuta con sudo: sudo ./deploy.sh"

echo ""
echo "═══════════════════════════════════════════════════"
echo "   Fmatputes Dashboard — Despliegue Automático"
echo "   Dominio: $DOMAIN"
echo "═══════════════════════════════════════════════════"
echo ""

# ── 1. Instalar dependencias del sistema ───────────────────
log "Actualizando paquetes..."
apt update -qq && apt upgrade -y -qq

if ! command -v docker &>/dev/null; then
  log "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  # Agregar usuario actual al grupo docker
  REAL_USER="${SUDO_USER:-$USER}"
  usermod -aG docker "$REAL_USER"
  log "Docker instalado."
else
  log "Docker ya está instalado: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
  log "Instalando Docker Compose plugin..."
  apt install -y -qq docker-compose-plugin
  log "Docker Compose instalado."
else
  log "Docker Compose ya está instalado."
fi

if ! command -v git &>/dev/null; then
  apt install -y -qq git
fi

# ── 2. Firewall ───────────────────────────────────────────
log "Configurando firewall (UFW)..."
apt install -y -qq ufw
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp   >/dev/null  # SSH
ufw allow 80/tcp   >/dev/null  # HTTP
ufw allow 443/tcp  >/dev/null  # HTTPS
ufw --force enable >/dev/null
log "Firewall activo: SSH(22), HTTP(80), HTTPS(443)."

# ── 3. Nginx Proxy Manager ────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -q "nginx-proxy-manager"; then
  log "Instalando Nginx Proxy Manager..."
  mkdir -p "$NPM_DIR"
  cat > "$NPM_DIR/docker-compose.yml" << 'NPMEOF'
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "127.0.0.1:81:81"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - backend_network

networks:
  backend_network:
    name: backend_network
    driver: bridge
NPMEOF

  cd "$NPM_DIR"
  docker compose up -d
  log "Nginx Proxy Manager levantado."
  warn "Panel admin en http://localhost:81"
  warn "  Login default: admin@example.com / changeme"
  warn "  ¡Cambia la contraseña inmediatamente!"
else
  log "Nginx Proxy Manager ya está corriendo."
fi

# Asegurar que la red backend_network existe
docker network inspect backend_network >/dev/null 2>&1 || \
  docker network create backend_network

# ── 4. Clonar / actualizar el proyecto ─────────────────────
if [ -d "$APP_DIR/.git" ]; then
  log "Repositorio encontrado, actualizando..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  log "Clonando repositorio..."
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi
log "Código en $APP_DIR (rama: $BRANCH)"

# ── 5. Crear .env si no existe ─────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  warn "Creando archivo .env de producción..."

  JWT_SECRET=$(openssl rand -hex 32)
  DB_PASS=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)

  cat > "$APP_DIR/.env" << EOF
# ── Base de datos ──
DB_USER=fmaputes_admin
DB_PASSWORD=${DB_PASS}
DB_NAME=fmaputes_db

# ── Backend ──
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=https://${DOMAIN}
EOF

  chmod 600 "$APP_DIR/.env"
  log ".env generado con credenciales seguras."
  echo ""
  echo "  ┌─────────────────────────────────────────┐"
  echo "  │  DB_PASSWORD = ${DB_PASS}"
  echo "  │  JWT_SECRET  = ${JWT_SECRET}"
  echo "  │                                         │"
  echo "  │  ¡¡ GUARDA ESTAS CREDENCIALES !!        │"
  echo "  └─────────────────────────────────────────┘"
  echo ""
else
  log ".env ya existe, se mantiene sin cambios."
fi

# ── 6. Build y arranque de la aplicación ───────────────────
cd "$APP_DIR"
log "Construyendo y levantando contenedores..."
docker compose up --build -d

# Esperar a que el backend esté healthy
echo -n "   Esperando que el backend esté healthy"
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' fmaputes_backend 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    echo ""
    log "Backend healthy."
    break
  fi
  echo -n "."
  sleep 2
done

if [ "$STATUS" != "healthy" ]; then
  warn "Backend aún no reporta healthy (puede tardar unos segundos más)."
fi

# ── 7. Verificación final ─────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "   Estado de los contenedores"
echo "═══════════════════════════════════════════════════"
docker compose ps
echo ""

FRONTEND_OK=$(curl -so /dev/null -w "%{http_code}" http://127.0.0.1:4200 2>/dev/null || echo "000")
if [ "$FRONTEND_OK" = "200" ]; then
  log "Frontend respondiendo en :4200"
else
  warn "Frontend no responde aún (HTTP $FRONTEND_OK)"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ¡DESPLIEGUE COMPLETADO!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Pasos restantes EN CLOUDFLARE:"
echo ""
echo "  1. DNS → Add Record:"
echo "     Tipo: A | Nombre: @ | IP: $(curl -4s ifconfig.me 2>/dev/null || echo 'TU_IP')"
echo "     Tipo: A | Nombre: www | IP: (misma)"
echo "     Proxy: ☁️ Proxied (naranja)"
echo ""
echo "  2. SSL/TLS → Overview → Full (strict)"
echo "     SSL/TLS → Edge Certificates → Always Use HTTPS ✅"
echo ""
echo "  3. EN NGINX PROXY MANAGER (http://localhost:81):"
echo "     → Proxy Hosts → Add:"
echo "       Domain: ${DOMAIN}, www.${DOMAIN}"
echo "       Scheme: http"
echo "       Forward Host: fmaputes_frontend"
echo "       Forward Port: 80"
echo "       SSL: Request Let's Encrypt cert"
echo "            ✅ Force SSL  ✅ HTTP/2"
echo ""
echo "  Después de eso: https://${DOMAIN} estará en línea."
echo ""
echo "  ── Comandos útiles ──"
echo "  Logs:      cd $APP_DIR && docker compose logs -f"
echo "  Reiniciar: cd $APP_DIR && docker compose restart"
echo "  Actualizar: cd $APP_DIR && git pull && docker compose up --build -d"
echo "  Backup DB: docker exec fmaputes_db pg_dump -U fmaputes_admin fmaputes_db > backup.sql"
echo ""
