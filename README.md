# Web Inspector

Monorepo para inspeção e captura de webhooks, permitindo visualizar, analisar e gerenciar requisições webhook de forma centralizada.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para o banco de dados)

## 🏗️ Estrutura do Projeto

```
web-insp/
├── api/              # Backend API (Fastify + Drizzle ORM)
│   ├── src/
│   │   ├── db/       # Configuração do banco e migrations
│   │   └── routes/   # Rotas da API
│   └── docker-compose.yml
└── web/              # Frontend (React + Vite + TanStack Router)
    └── src/
        ├── components/
        └── pages/
```

## 🚀 Get Started

### 1. Dependências

No diretório raiz do projeto, instale todas as dependências do monorepo:

```bash
pnpm i
```

### 2. Banco de Dados com Docker

O projeto utiliza PostgreSQL rodando em um container Docker. Para subir o banco de dados:

```bash
cd api
docker-compose up -d
```

Isso irá:
- Criar um container PostgreSQL na porta `5432`
- Configurar o banco de dados `webhooks`
- Usuário: `docker`
- Senha: `docker`

**Verificar se o container está rodando:**
```bash
docker ps
```

Você deve ver o container `webhooks_db` em execução.

### 3. Configuração da API

A API precisa de variáveis de ambiente. Crie um arquivo `.env` no diretório `api/`:

```bash
cd api
touch .env
```

Adicione as seguintes variáveis no arquivo `.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/webhooks
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_aqui
```

> **Nota:** Substitua `sua_chave_api_aqui` pela sua chave real da API do Google Generative AI.

### 4. Migrations do Banco de Dados

Após configurar o banco e as variáveis de ambiente, execute as migrations para criar as tabelas:

```bash
cd api
pnpm db:migrate
```

Isso irá aplicar todas as migrations definidas em `api/src/db/migrations/`.

### 5. (Seed) - Opcional

Para popular o banco com dados de exemplo (60 webhooks simulados do Stripe):

```bash
cd api
pnpm db:seed
```

### 6. Servidor da API

Com o banco configurado e as migrations aplicadas, inicie o servidor da API:

```bash
cd api
pnpm dev
```

O servidor estará disponível em:
- **API:** http://localhost:3333
- **Documentação (Swagger):** http://localhost:3333/docs

### 7. Frontend

Em um novo terminal, navegue até o diretório `web/` e inicie o servidor de desenvolvimento:

```bash
cd web
pnpm dev
```
