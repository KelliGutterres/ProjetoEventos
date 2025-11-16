#!/bin/bash

# Script de Instalação Automatizada - Projeto Eventos
# Execute com: bash install-vm.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação do Projeto Eventos na VM..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute com sudo: sudo bash install-vm.sh"
    exit 1
fi

# Diretório base - pode ser alterado pelo usuário
echo ""
print_info "Onde você deseja instalar os projetos?"
print_info "1) ~/projetos (diretório home do usuário atual - recomendado)"
print_info "2) /opt/projetos"
print_info "3) Outro (digite o caminho completo)"
read -p "Escolha (1/2/3 ou caminho): " DIR_CHOICE

# Obter o usuário real (não o root se executado com sudo)
REAL_USER=${SUDO_USER:-$USER}
REAL_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)

case $DIR_CHOICE in
    1)
        BASE_DIR="$REAL_HOME/projetos"
        ;;
    2)
        BASE_DIR="/opt/projetos"
        ;;
    *)
        BASE_DIR="$DIR_CHOICE"
        ;;
esac

print_info "Diretório escolhido: $BASE_DIR"
mkdir -p $BASE_DIR
# Se for no diretório home, ajustar permissões
if [[ "$BASE_DIR" == "$REAL_HOME"* ]]; then
    chown -R $REAL_USER:$REAL_USER $BASE_DIR 2>/dev/null || true
fi
cd $BASE_DIR

# PASSO 1: Atualizar lista de pacotes (sem atualizar pacotes existentes)
print_info "Atualizando lista de pacotes (sem atualizar pacotes existentes)..."
print_info "⚠️  Isso preserva suas configurações existentes na VM"
apt update -y
print_success "Lista de pacotes atualizada"

# PASSO 2: Instalar Node.js
print_info "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js instalado: $(node --version)"
else
    print_info "Node.js já está instalado: $(node --version)"
fi

# PASSO 3: Instalar Git
print_info "Instalando Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
    print_success "Git instalado: $(git --version)"
else
    print_info "Git já está instalado: $(git --version)"
fi

# PASSO 4: Instalar PM2
print_info "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 instalado: $(pm2 --version)"
else
    print_info "PM2 já está instalado: $(pm2 --version)"
fi

# PASSO 5: Instalar Nginx
print_info "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx instalado e iniciado"
else
    print_info "Nginx já está instalado"
fi

# PASSO 6: Criar diretório de logs
print_info "Criando diretório de logs..."
mkdir -p $BASE_DIR/logs
chmod 755 $BASE_DIR/logs
print_success "Diretório de logs criado em $BASE_DIR/logs"

# PASSO 7: Solicitar informações do usuário
echo ""
print_info "Por favor, forneça as seguintes informações:"
read -p "Usuário do GitHub (ou URL completa do repositório): " GITHUB_USER
read -p "IP ou domínio da VM (ex: 192.168.1.100 ou meusite.com): " VM_DOMAIN
read -p "Senha do PostgreSQL: " DB_PASSWORD
read -p "API Key do SendGrid (ou pressione Enter para pular): " SENDGRID_KEY
read -p "Email remetente do SendGrid (ou pressione Enter para pular): " SENDGRID_EMAIL

# PASSO 8: Clonar repositórios
echo ""
print_info "Clonando repositórios..."

if [ -d "$BASE_DIR/ProjetoEventos" ]; then
    print_info "ProjetoEventos já existe, atualizando..."
    cd $BASE_DIR/ProjetoEventos
    git pull
else
    if [[ $GITHUB_USER == http* ]]; then
        git clone $GITHUB_USER/ProjetoEventos.git $BASE_DIR/ProjetoEventos
    else
        git clone https://github.com/$GITHUB_USER/ProjetoEventos.git $BASE_DIR/ProjetoEventos
    fi
fi

if [ -d "$BASE_DIR/ProjetoEventosEmail" ]; then
    print_info "ProjetoEventosEmail já existe, atualizando..."
    cd $BASE_DIR/ProjetoEventosEmail
    git pull
else
    if [[ $GITHUB_USER == http* ]]; then
        git clone $GITHUB_USER/ProjetoEventosEmail.git $BASE_DIR/ProjetoEventosEmail
    else
        git clone https://github.com/$GITHUB_USER/ProjetoEventosEmail.git $BASE_DIR/ProjetoEventosEmail
    fi
fi

if [ -d "$BASE_DIR/FrontendEventos" ]; then
    print_info "FrontendEventos já existe, atualizando..."
    cd $BASE_DIR/FrontendEventos
    git pull
else
    if [[ $GITHUB_USER == http* ]]; then
        git clone $GITHUB_USER/FrontendEventos.git $BASE_DIR/FrontendEventos
    else
        git clone https://github.com/$GITHUB_USER/FrontendEventos.git $BASE_DIR/FrontendEventos
    fi
fi

print_success "Repositórios clonados/atualizados"

# PASSO 9: Instalar dependências
echo ""
print_info "Instalando dependências dos projetos..."

cd $BASE_DIR/ProjetoEventos
npm install
print_success "Dependências do ProjetoEventos instaladas"

cd $BASE_DIR/ProjetoEventosEmail
npm install
print_success "Dependências do ProjetoEventosEmail instaladas"

cd $BASE_DIR/FrontendEventos
npm install
print_success "Dependências do FrontendEventos instaladas"

# PASSO 10: Criar arquivos .env
echo ""
print_info "Criando arquivos de configuração .env..."

# Backend Principal
cat > $BASE_DIR/ProjetoEventos/.env << EOF
# Configurações do Banco de Dados PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=projeto_eventos
DB_PASSWORD=$DB_PASSWORD
DB_PORT=5432

# Configurações do Servidor
PORT=3000

# Ambiente (development, production)
NODE_ENV=production

# CORS - URLs permitidas
ALLOWED_ORIGINS=http://localhost:5173,http://$VM_DOMAIN
EOF
print_success "Arquivo .env do ProjetoEventos criado"

# Backend de Emails
cat > $BASE_DIR/ProjetoEventosEmail/.env << EOF
# Configurações do Banco de Dados PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=projeto_eventos
DB_PASSWORD=$DB_PASSWORD
DB_PORT=5432

# Configurações do Servidor
PORT=3001

# Ambiente (development, production)
NODE_ENV=production

# Configurações do SendGrid
SENDGRID_API_KEY=$SENDGRID_KEY
SENDGRID_FROM=$SENDGRID_EMAIL

# CORS - URLs permitidas
ALLOWED_ORIGINS=http://localhost:5173,http://$VM_DOMAIN
EOF
print_success "Arquivo .env do ProjetoEventosEmail criado"

# Frontend (OBRIGATÓRIO - sem isso o frontend usará localhost que não funciona na VM)
cat > $BASE_DIR/FrontendEventos/.env << EOF
# URLs das APIs
# IMPORTANTE: Sem este arquivo, o frontend tentará usar localhost:3000 e localhost:3001
# que não funcionarão quando acessados de fora da VM
VITE_API_URL=http://$VM_DOMAIN:3000
VITE_API_EMAIL_URL=http://$VM_DOMAIN:3001
EOF
print_success "Arquivo .env do FrontendEventos criado (necessário para produção)"

# PASSO 11: Build do frontend
echo ""
print_info "Fazendo build do frontend..."
cd $BASE_DIR/FrontendEventos
npm run build
print_success "Build do frontend concluído"

# PASSO 12: Configurar Nginx
echo ""
print_info "Configurando Nginx..."
print_info "Configurando Nginx com caminho: $BASE_DIR/FrontendEventos/dist"
cat > /etc/nginx/sites-available/frontend-eventos << EOF
server {
    listen 80;
    server_name $VM_DOMAIN;

    root $BASE_DIR/FrontendEventos/dist;
    index index.html;

    # Configuração para SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/frontend-eventos /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t
systemctl reload nginx
print_success "Nginx configurado"

# PASSO 13: Configurar PM2
echo ""
print_info "Configurando PM2..."
cat > $BASE_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'projeto-eventos-api',
      script: './ProjetoEventos/server.js',
      cwd: '$BASE_DIR/ProjetoEventos',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '$BASE_DIR/logs/api-error.log',
      out_file: '$BASE_DIR/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'projeto-eventos-email',
      script: './ProjetoEventosEmail/server.js',
      cwd: '$BASE_DIR/ProjetoEventosEmail',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '$BASE_DIR/logs/email-error.log',
      out_file: '$BASE_DIR/logs/email-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Iniciar aplicações
cd $BASE_DIR
pm2 start ecosystem.config.js
pm2 save

# Configurar startup automático
STARTUP_CMD=$(pm2 startup systemd | grep -v "PM2" | tail -1)
eval $STARTUP_CMD

print_success "PM2 configurado e aplicações iniciadas"

# PASSO 14: Configurar Firewall
echo ""
print_info "Configurando firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
print_success "Firewall configurado"

# PASSO 15: Verificação final
echo ""
print_info "Verificando instalação..."
echo ""

# Verificar PM2
if pm2 list | grep -q "projeto-eventos-api"; then
    print_success "Backend principal está rodando"
else
    print_error "Backend principal não está rodando"
fi

if pm2 list | grep -q "projeto-eventos-email"; then
    print_success "Backend de emails está rodando"
else
    print_error "Backend de emails não está rodando"
fi

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx está rodando"
else
    print_error "Nginx não está rodando"
fi

echo ""
print_success "Instalação concluída!"
echo ""
echo "📋 Informações importantes:"
echo "   - Frontend: http://$VM_DOMAIN"
echo "   - API Principal: http://$VM_DOMAIN:3000"
echo "   - API Emails: http://$VM_DOMAIN:3001"
echo "   - Swagger API: http://$VM_DOMAIN:3000/api-docs"
echo ""
echo "📝 Comandos úteis:"
echo "   - Ver status: pm2 status"
echo "   - Ver logs: pm2 logs"
echo "   - Reiniciar: pm2 restart all"
echo ""
print_info "IMPORTANTE: Verifique os arquivos .env e ajuste as configurações se necessário!"

