# 🔥 Firebase Google OAuth Setup Guide

## 🎯 OBJETIVO
Configurar **autenticação Google real** com **domain restriction @cloudwalk.io** e **API keys no servidor**.

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Criar Projeto Firebase**

1. **Acesse**: https://console.firebase.google.com/
2. **Clique**: "Create a project" 
3. **Nome**: `cloudwalk-omni-jimmer`
4. **Google Analytics**: Desabilitar (opcional)
5. **Clique**: "Create project"

### **PASSO 2: Configurar Authentication**

1. **No Firebase Console** → **Authentication** 
2. **Clique**: "Get started"
3. **Aba "Sign-in method"**
4. **Clique**: "Google"
5. **Toggle**: "Enable" ✅
6. **Project public-facing name**: "DesignTeam - Cloudwalk"
7. **Support email**: Seu email @cloudwalk.io
8. **Clique**: "Save"

### **PASSO 3: Adicionar Domínios Autorizados**

1. **Authentication** → **Settings** → **Authorized domains**
2. **Add domain**: `alecrimcloudwalk.github.io` 
3. **Add domain**: `localhost` (para desenvolvimento)
4. **Clique**: "Done"

### **PASSO 4: Configurar Web App**

1. **Project Overview** → **⚙️ Project settings**
2. **Scroll down** → **Your apps**
3. **Clique**: "Web" ícone `</>`
4. **App nickname**: `omni-jimmer-web`
5. **Hosting**: NÃO marcar
6. **Clique**: "Register app"
7. **COPIE** o objeto `firebaseConfig` que aparece

### **PASSO 5: Atualizar Código**

**Substitua** o conteúdo do arquivo `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Cole seu API key aqui
  authDomain: "cloudwalk-omni-jimmer.firebaseapp.com",
  projectId: "cloudwalk-omni-jimmer", 
  storageBucket: "cloudwalk-omni-jimmer.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

window.firebaseConfig = firebaseConfig;
```

### **PASSO 6: Configurar Domain Restriction (CRUCIAL)**

#### **Método 1: Firebase Rules (Recomendado)**
1. **Authentication** → **Settings** → **Authorized domains**
2. **Adicione apenas**: `cloudwalk.io` (não adicione outros domínios de email)

#### **Método 2: Google Cloud Console**
1. **Acesse**: https://console.cloud.google.com/
2. **Selecione** seu projeto Firebase
3. **APIs & Services** → **Credentials**
4. **Clique** na sua "Web client (auto created by Google Service)"
5. **Authorized JavaScript origins**: Adicione `https://alecrimcloudwalk.github.io`
6. **Authorized redirect URIs**: Adicione `https://alecrimcloudwalk.github.io/__/auth/handler`

### **PASSO 7: Testar Localmente**

```bash
# 1. Commit as mudanças
git add firebase-config.js
git commit -m "Configure Firebase OAuth"
git push origin main

# 2. Acesse no navegador
open https://alecrimcloudwalk.github.io/omni-jimmer/

# 3. Teste login com @cloudwalk.io
```

---

## 🔐 CONFIGURAÇÃO AVANÇADA (API Keys no Servidor)

### **PASSO 8: Criar Service Account**

1. **Google Cloud Console** → **IAM & Admin** → **Service Accounts**
2. **Create Service Account**:
   - **Name**: `omni-jimmer-server`
   - **ID**: `omni-jimmer-server`
   - **Description**: "Server-side authentication for Omni-jimmer"
3. **Create and Continue**
4. **Role**: `Firebase Admin SDK Administrator Service Agent`
5. **Continue** → **Done**

### **PASSO 9: Gerar Private Key**

1. **Clique** na service account criada
2. **Keys** tab → **Add Key** → **Create new key**
3. **Key type**: JSON
4. **Create** → Download do arquivo JSON

### **PASSO 10: Configurar Environment Variables**

**No Vercel/servidor, adicione**:

```bash
# Firebase Admin
FIREBASE_PROJECT_ID=cloudwalk-omni-jimmer
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...sua chave...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=omni-jimmer-server@cloudwalk-omni-jimmer.iam.gserviceaccount.com

# API Keys
OPENAI_API_KEY=sk-proj-your-openai-key
REPLICATE_API_TOKEN=r8_your-replicate-token

# Auth
ALLOWED_DOMAIN=cloudwalk.io
```

---

## 🧪 TESTE E VALIDAÇÃO

### **Testes Funcionais:**

#### **✅ Teste 1: Login Válido**
1. **Acesse**: https://alecrimcloudwalk.github.io/omni-jimmer/
2. **Clique**: "Continue with Cloudwalk Account"
3. **Popup**: Aparece login Google
4. **Login**: Com email @cloudwalk.io
5. **Resultado**: ✅ Acesso liberado

#### **❌ Teste 2: Login Inválido**
1. **Repita** passos 1-3
2. **Login**: Com email @gmail.com
3. **Resultado**: ❌ "Access Restricted" → Volta para tela de login

#### **🔄 Teste 3: Persistência**
1. **Após login** válido → Refresh da página
2. **Resultado**: ✅ Continua logado (não pede login novamente)

#### **🚪 Teste 4: Logout**
1. **Clique**: "Sign Out" no header
2. **Resultado**: ✅ Volta para tela de login

---

## 🚨 TROUBLESHOOTING

### **Erro: "popup-blocked"**
**Solução**: Permitir popups para o site

### **Erro: "unauthorized-domain"**  
**Solução**: Verificar domínios autorizados no Firebase

### **Erro: "invalid-api-key"**
**Solução**: Verificar `firebase-config.js` com valores corretos

### **Login funciona mas não restrige domínio**
**Solução**: Verificar `hd: cloudwalk.io` no provider + validação no código

### **Console Errors**
1. **F12** → Console
2. **Procurar**: Mensagens começando com ❌
3. **Logs úteis**: 
   - `🔥 Initializing Firebase Auth...`
   - `✅ Firebase Auth initialized`
   - `🔐 Using Firebase Google Auth`

---

## 📊 STATUS APÓS SETUP

### **✅ Com Firebase Configurado:**
- **Login real** com popup Google
- **Domain restriction** nativo (@cloudwalk.io)
- **Session management** automático
- **Fallback** para demo mode se Firebase falhar

### **🔮 Próximo Nível (Opcional):**
- **API keys** 100% no servidor
- **JWT verification** nos endpoints
- **Zero setup** para usuários finais

---

## 🎯 CHECKLIST DE CONFIGURAÇÃO

- [ ] Projeto Firebase criado
- [ ] Google Auth habilitado
- [ ] Domínios autorizados adicionados  
- [ ] Web app registrado
- [ ] `firebase-config.js` atualizado
- [ ] Domain restriction configurada
- [ ] Código commitado e deployado
- [ ] Testes de login executados
- [ ] Testes de domain restriction validados

---

**⏱️ Tempo estimado: 30-45 minutos**

**🎉 Resultado: Google OAuth real funcionando com domain restriction!**
