# 🚀 Guia Completo de Deploy na Vercel

## Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Git**: Para versionamento
3. **Node.js 18+**: Para desenvolvimento local

## 🚀 Deploy Rápido (Recomendado)

### Opção 1: Script Automatizado

\`\`\`bash
# 1. Dar permissão ao script
chmod +x deploy-vercel.sh

# 2. Executar deploy
./deploy-vercel.sh
\`\`\`

### Opção 2: Deploy Manual

\`\`\`bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Configurar variáveis de ambiente
vercel env add NODE_ENV production
vercel env add JWT_SECRET $(openssl rand -hex 32)
vercel env add JWT_EXPIRATION 24h

# 4. Fazer deploy
vercel --prod
\`\`\`

### Opção 3: Deploy via GitHub (Recomendado para Produção)

1. **Push para GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Deploy API na Vercel"
   git push origin main
   \`\`\`

2. **Conectar na Vercel**:
   - Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure as variáveis de ambiente
   - Deploy automático!

## 🔧 Configuração Pós-Deploy

### 1. Obter URL do Projeto

\`\`\`bash
vercel ls
\`\`\`

### 2. Testar API

\`\`\`bash
# Health check
curl https://sua-api.vercel.app/api/health

# Login
curl -X POST https://sua-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
\`\`\`

### 3. Configurar Variáveis de Ambiente

Na dashboard da Vercel ou via CLI:

\`\`\`bash
# Essenciais
vercel env add NODE_ENV production
vercel env add JWT_SECRET $(openssl rand -hex 32)
vercel env add JWT_EXPIRATION 24h

# Opcional - para fazer deploys de outros projetos
vercel env add VERCEL_TOKEN seu_token_aqui
\`\`\`

## 📊 Monitoramento

### Ver Projetos

\`\`\`bash
vercel ls
\`\`\`

### Ver Logs

\`\`\`bash
vercel logs --limit 50
\`\`\`

### Ver Variáveis

\`\`\`bash
vercel env ls
\`\`\`

### Abrir Dashboard

\`\`\`bash
vercel dashboard
\`\`\`

## 🔧 Solução de Problemas

### Deploy Falha

1. **Verificar logs**:
   \`\`\`bash
   vercel logs
   \`\`\`

2. **Verificar build local**:
   \`\`\`bash
   npm run build
   \`\`\`

3. **Redeploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

### API não Responde

1. **Verificar se o deploy foi bem-sucedido**:
   \`\`\`bash
   vercel ls
   \`\`\`

2. **Verificar health check**:
   \`\`\`bash
   curl https://sua-api.vercel.app/api/health
   \`\`\`

3. **Verificar logs de função**:
   \`\`\`bash
   vercel logs --limit 100
   \`\`\`

### Problemas de CORS

Se encontrar problemas de CORS, verifique o arquivo \`vercel.json\` e certifique-se de que os headers estão configurados corretamente.

### Timeout de Função

As funções serverless da Vercel têm limite de tempo. Para operações longas, considere:

1. Usar webhooks para notificações
2. Implementar polling para status
3. Dividir operações em etapas menores

## 🌟 Recursos Disponíveis

Após o deploy, sua API terá:

- **Endpoint Principal**: \`https://sua-api.vercel.app\`
- **Health Check**: \`https://sua-api.vercel.app/api/health\`
- **Documentação**: \`https://sua-api.vercel.app/docs\`
- **Autenticação**: \`https://sua-api.vercel.app/api/auth/login\`
- **Deploy API**: \`https://sua-api.vercel.app/api/deploy\`

## 🔐 Credenciais Padrão

- **Usuário**: \`admin\`
- **Senha**: \`admin123\`

⚠️ **Importante**: Altere as credenciais padrão em produção!

## 🚀 Vantagens da Vercel

- ✅ **Deploy automático** via Git
- ✅ **Escalabilidade automática**
- ✅ **CDN global** integrado
- ✅ **HTTPS** automático
- ✅ **Domínios customizados** gratuitos
- ✅ **Logs em tempo real**
- ✅ **Rollback** fácil
- ✅ **Preview deployments** para PRs

## 📝 Próximos Passos

1. Teste todos os endpoints usando a documentação
2. Configure seu token da Vercel para deploys
3. Integre com seus sistemas CI/CD
4. Configure webhooks se necessário
5. Monitore logs e performance
6. Configure domínio customizado (opcional)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: \`vercel logs\`
2. Consulte a documentação: \`/docs\`
3. Teste o health check: \`/api/health\`
4. Verifique as variáveis de ambiente
5. Consulte a [documentação da Vercel](https://vercel.com/docs)
\`\`\`

### 9️⃣ Exemplo de Uso Pós-Deploy
