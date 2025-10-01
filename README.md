# 🤖 Synapse - Sistema RAG Corporativo

Sistema de chatbot inteligente para uso corporativo interno onde usuários autenticados podem fazer perguntas em linguagem natural sobre documentos carregados e receber respostas contextualizadas com score de confiança.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: NextAuth v5
- **UI**: shadcn/ui + Tailwind CSS
- **IA**: OpenAI API (GPT + Embeddings)
- **Validação**: Zod

## ✨ Funcionalidades

- ✅ Autenticação de usuários
- ✅ Upload de documentos (TXT, PDF, DOCX)
- ✅ Múltiplas conversas por usuário
- ✅ Chat com sistema RAG (Retrieval-Augmented Generation)
- ✅ Score de confiança nas respostas
- ✅ Rate limiting (50 perguntas/dia)
- ✅ Histórico de conversas
- ✅ Edição de títulos de conversas
- ✅ Interface responsiva e moderna

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- pnpm (ou npm/yarn)
- Conta OpenAI com API key

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd chatbot-tcc-rag
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha:

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco
OPENAI_API_KEY=sk-proj-sua-chave-aqui
AUTH_SECRET=seu-secret-minimo-32-caracteres
NODE_ENV=development
```

**Gerar AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configure o banco de dados

```bash
# Gerar migrations
pnpm run db:generate

# Executar migrations
pnpm run db:migrate

# (Opcional) Visualizar banco com Drizzle Studio
pnpm run db:studio
```

### 5. Execute o projeto

**Desenvolvimento:**
```bash
pnpm run dev
```

**Produção:**
```bash
pnpm run build
pnpm run start
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
chatbot-tcc-rag/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   └── api/
│   └── (chat)/              # Rotas principais
│       ├── chat/[id]/       # Página de chat
│       ├── documents/       # Gerenciamento de documentos
│       └── layout.tsx       # Layout compartilhado
├── components/              # Componentes React
│   ├── ui/                  # Componentes shadcn/ui
│   └── ...                  # Componentes customizados
├── lib/
│   ├── actions/             # Server Actions
│   │   ├── conversations.ts
│   │   ├── documents.ts
│   │   └── messages.ts
│   ├── db/
│   │   ├── queries/         # Database queries por contexto
│   │   └── schema/          # Schemas do banco
│   ├── validations/         # Schemas Zod
│   └── types/               # TypeScript types
└── public/                  # Arquivos estáticos
```

## 🔐 Segurança

- **Autenticação**: Todas as rotas protegidas exceto login/registro
- **Validação**: Zod valida todas as entradas de usuário
- **Ownership**: Usuários só podem acessar/editar seus próprios dados
- **Rate Limiting**: Máximo 50 perguntas por dia por usuário
- **Validação de arquivos**: Tipo e tamanho validados antes do upload

## 📝 Scripts Disponíveis

```bash
pnpm run dev          # Inicia servidor de desenvolvimento
pnpm run build        # Build para produção
pnpm run start        # Inicia servidor de produção
pnpm run lint         # Executa ESLint

# Database
pnpm run db:generate  # Gera migrations
pnpm run db:migrate   # Executa migrations
pnpm run db:studio    # Abre Drizzle Studio
pnpm run db:push      # Push schema para o banco (dev)
pnpm run db:drop      # Dropa tabelas
```

## 🎯 Como Usar

### Primeiro Acesso

1. **Criar usuário**: Use o endpoint `/api/register` (POST)
   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"senha123"}'
   ```

2. **Fazer login**: Acesse `/login` e entre com suas credenciais

3. **Upload de documentos**: Vá em "Documentos" e faça upload de arquivos TXT, PDF ou DOCX

4. **Criar conversa**: Clique em "Nova Conversa" na sidebar

5. **Fazer perguntas**: Digite suas perguntas sobre os documentos carregados

### Documentos Compartilhados

- Todos os usuários podem **visualizar** todos os documentos
- Apenas o usuário que fez upload pode **deletar** o documento
- O sistema busca em todos os documentos disponíveis ao responder

## 🤖 Sistema RAG

O sistema usa Retrieval-Augmented Generation para responder perguntas:

1. **Chunking**: Documentos são divididos em pedaços menores
2. **Embeddings**: Cada chunk é convertido em vetor usando OpenAI
3. **Busca Semântica**: Encontra chunks relevantes para a pergunta
4. **Geração**: LLM gera resposta baseada nos chunks encontrados
5. **Confidence Score**: Calcula score de confiança baseado na relevância

## 📊 Banco de Dados

### Tabelas Principais

- `users` - Usuários do sistema
- `conversations` - Conversas dos usuários
- `messages` - Mensagens das conversas
- `documents` - Documentos carregados
- `daily_usage` - Controle de rate limiting

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se `AUTH_SECRET` tem no mínimo 32 caracteres
- Confirme que as variáveis de ambiente estão corretas

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a string de conexão `DATABASE_URL`
- Execute as migrations: `pnpm run db:migrate`

### Upload de documento falha
- Verifique se o arquivo é TXT, PDF ou DOCX
- Confirme que o tamanho é menor que 10MB
- Verifique os logs do servidor

### Rate limit atingido
- Limite é de 50 mensagens por dia por usuário
- O contador reseta à meia-noite
- Verifique a tabela `daily_usage`

## 📄 Licença

Este projeto é parte de um trabalho de conclusão de curso.

## 👥 Contribuindo

Este é um projeto acadêmico. Para sugestões ou melhorias, abra uma issue.
