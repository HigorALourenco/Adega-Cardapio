#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}▲ Deploy Automatizado na Vercel - API Deploy${NC}"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️ Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha ao instalar Vercel CLI${NC}"
        exit 1
    fi
fi

# Verificar se está logado
echo -e "${BLUE}🔐 Verificando autenticação...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️ Não está logado na Vercel. Fazendo login...${NC}"
    vercel login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha no login da Vercel${NC}"
        exit 1
    fi
fi

# Limpar arquivos temporários
echo -e "${BLUE}🧹 Limpando arquivos temporários...${NC}"
rm -rf .next
rm -rf .vercel
rm -rf node_modules/.cache

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

# Verificar se o projeto já existe
echo -e "${BLUE}📋 Configurando projeto...${NC}"

# Criar arquivo de configuração se não existir
if [ ! -f .vercelignore ]; then
    cat > .vercelignore << EOF
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
/build
/.next/
/out/

# Misc
.DS_Store
*.tsbuildinfo

# Debug
*.log

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel
EOF
    echo -e "${GREEN}✅ Arquivo .vercelignore criado${NC}"
fi

# Configurar variáveis de ambiente
echo -e "${BLUE}🔧 Configurando variáveis de ambiente...${NC}"

# Gerar JWT_SECRET se não existir
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "vercel_deploy_api_secret_$(date +%s)")

# Configurar variáveis essenciais
vercel env add NODE_ENV production
vercel env add JWT_SECRET "$JWT_SECRET"
vercel env add JWT_EXPIRATION 24h

# Perguntar se o usuário quer configurar o token da Vercel
read -p "Deseja configurar o VERCEL_TOKEN agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Digite seu Vercel Token: " VERCEL_TOKEN
    if [ ! -z "$VERCEL_TOKEN" ]; then
        vercel env add VERCEL_TOKEN "$VERCEL_TOKEN"
        echo -e "${GREEN}✅ Token da Vercel configurado${NC}"
    fi
fi

# Fazer deploy
echo -e "${BLUE}🚀 Iniciando deploy...${NC}"
vercel --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no deploy${NC}"
    exit 1
fi

# Aguardar um pouco para o deploy processar
echo -e "${BLUE}⏳ Aguardando deploy processar...${NC}"
sleep 10

# Obter URL do projeto
echo -e "${BLUE}🌐 Obtendo informações do projeto...${NC}"
PROJECT_URL=$(vercel ls | grep "$(basename $(pwd))" | head -1 | awk '{print $2}' 2>/dev/null)

if [ ! -z "$PROJECT_URL" ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo -e "${GREEN}🌐 URL da API: https://$PROJECT_URL${NC}"
    echo -e "${GREEN}🏥 Health Check: https://$PROJECT_URL/api/health${NC}"
    echo -e "${GREEN}📚 Documentação: https://$PROJECT_URL/docs${NC}"
    echo -e "${GREEN}🔐 Login: https://$PROJECT_URL/api/auth/login${NC}"
    echo ""
    echo -e "${BLUE}📋 Credenciais padrão:${NC}"
    echo -e "${YELLOW}👤 Usuário: admin${NC}"
    echo -e "${YELLOW}🔑 Senha: admin123${NC}"
    echo ""
    echo -e "${BLUE}🔧 Para gerenciar o projeto:${NC}"
    echo -e "${YELLOW}📊 Status: vercel ls${NC}"
    echo -e "${YELLOW}📝 Logs: vercel logs${NC}"
    echo -e "${YELLOW}⚙️ Variáveis: vercel env ls${NC}"
    echo -e "${YELLOW}🌐 Abrir dashboard: vercel dashboard${NC}"
    
    # Testar health check
    echo -e "${BLUE}🧪 Testando health check...${NC}"
    sleep 5
    
    if curl -s "https://$PROJECT_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Health check passou!${NC}"
    else
        echo -e "${YELLOW}⚠️ Health check ainda não está respondendo. Aguarde alguns minutos.${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️ Deploy concluído, mas não foi possível obter a URL automaticamente.${NC}"
    echo -e "${YELLOW}Use 'vercel ls' para ver seus projetos.${NC}"
fi

echo ""
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo -e "${YELLOW}1. Aguarde alguns minutos para o serviço ficar totalmente ativo${NC}"
echo -e "${YELLOW}2. Teste a API usando a documentação em /docs${NC}"
echo -e "${YELLOW}3. Configure seu token da Vercel se ainda não fez${NC}"
echo -e "${YELLOW}4. Comece a fazer deploys usando a API!${NC}"

echo ""
echo -e "${BLUE}🎯 Exemplo de teste rápido:${NC}"
if [ ! -z "$PROJECT_URL" ]; then
    echo -e "${YELLOW}curl https://$PROJECT_URL/api/health${NC}"
    echo -e "${YELLOW}curl -X POST https://$PROJECT_URL/api/auth/login -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123\"}'${NC}"
fi
