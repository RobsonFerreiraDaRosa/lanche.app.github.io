# Sistema de Pedidos Tribo Bar com Supabase

## Configuração Inicial

### 1. Configurar Supabase
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Acesse a seção **SQL Editor**
4. Execute o script SQL fornecido para criar as tabelas

### 2. Obter Credenciais
1. No painel do Supabase, vá para **Project Settings > API**
2. Copie:
   - **URL** (Project URL)
   - **anon key** (public key)

### 3. Configurar os Arquivos
No arquivo `supabase.js`, substitua:
```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-key';