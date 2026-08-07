# TaskManager Web

<div align="center">

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Azure Static Web Apps](https://img.shields.io/badge/Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Google Identity](https://img.shields.io/badge/Google_Identity-4285F4?style=for-the-badge&logo=google&logoColor=white)

*Frontend do TaskManager — Angular 22 com arquitetura hexagonal (Ports & Adapters), consumindo a [TaskManager API](https://github.com/sergiobsilva2505/task-manager.git)*

</div>

---

## 🏗️ Arquitetura

```
src/app/
├── domain/          entidades e regras puras — zero Angular
├── application/     portas (interfaces) + casos de uso
├── infrastructure/  adapters HTTP, interceptors, serviços de sessão
└── ui/              componentes standalone (features + shared)
```

A regra de dependência aponta sempre para dentro: `ui` → `infrastructure` → `application` → `domain`. Essa fronteira é fiscalizada automaticamente pelo `eslint-plugin-boundaries` a cada `npm run lint` e no CI/CD.

---

## ✨ Funcionalidades

### Autenticação

- Login com e-mail e senha
- Login com Google (Google Identity Services)
- Registro de conta
- Sessão em `sessionStorage` com verificação de expiração
- JWT anexado automaticamente via interceptor
- Guard de rotas com redirecionamento e `returnUrl`

### Tarefas

- Listagem paginada, com criação inline e avanço de status por um clique (anel de progresso)
- Detalhe de tarefa (`/tasks/:id`)
- Alteração de status e exclusão

### Dashboard

- Totais, tarefas atrasadas e tarefas a vencer em breve
- Distribuição por status e por prioridade

### Rotas

| Caminho      | Componente            | Guard       |
| ------------ | --------------------- | ----------- |
| `/`          | `TaskListComponent`   | `authGuard` |
| `/tasks/:id` | `TaskDetailComponent` | `authGuard` |
| `/dashboard` | `DashboardComponent`  | `authGuard` |
| `/login`     | `LoginComponent`      | —           |
| `/register`  | `RegisterComponent`   | —           |

---

## ✅ Testes

```bash
npm test
```

48 testes (13 arquivos) cobrindo domínio, use cases de auth e task (incluindo dashboard) e infraestrutura de auth. Runner: Vitest 4.x.

---

## 🚀 Como rodar localmente

**Pré-requisitos:** Node 22.12+ e a TaskManager API rodando em `http://localhost:8080`.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/taskmanager-web.git
cd taskmanager-web

# 2. Configure o environment
cp src/environments/environment.example.ts src/environments/environment.ts
# Edite environment.ts com seu Google Client ID

# 3. Instale as dependências
npm install

# 4. Suba o servidor de desenvolvimento
npm start
```

Acesse `http://localhost:4200`.

---

## 🏗️ Build de produção

```bash
npm run build:prod
```

Gera os arquivos em `dist/taskmanager-web/browser`.

---

## 🔍 Lint

```bash
npm run lint
```

Verifica as fronteiras hexagonais e as regras do Angular ESLint. Falha se qualquer camada importar algo que não deveria.

---

## ⚙️ Variáveis de ambiente

| Variável         | Descrição                                         |
| ---------------- | ------------------------------------------------- |
| `apiUrl`         | URL base da API (ex: `http://localhost:8080/api`) |
| `googleClientId` | Client ID do OAuth Google                         |

Em produção, o `GOOGLE_CLIENT_ID` é injetado via GitHub Secret antes do build — nunca entra no repositório.

---

## 🚢 Deploy

CI/CD configurado via GitHub Actions para Azure Static Web Apps. A cada push na `main` ou PR:

1. Instala dependências
2. Roda o lint (fronteiras hexagonais)
3. Injeta o `GOOGLE_CLIENT_ID` via secret
4. Build de produção
5. ~~Deploy no Azure~~ — **pausado no momento** (`if: false` no step `Deploy` e no job `close_pull_request`); o workflow segue validando lint + build a cada push, sem publicar.

Quando o deploy for retomado, PRs voltam a ganhar um ambiente de preview automático.

**Secrets necessários no GitHub (quando o deploy for reativado):**

- `GOOGLE_CLIENT_ID`
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (gerado pelo portal do Azure)

---

## 🗂️ Stack

| Tecnologia                        | Uso                                       |
| --------------------------------- | ----------------------------------------- |
| Angular 22                        | Framework — standalone, zoneless, signals |
| Vitest 4                          | Testes unitários                          |
| ESLint + eslint-plugin-boundaries | Lint e fronteiras hexagonais              |
| Azure Static Web Apps             | Hosting                                   |
| Google Identity Services          | Login social                              |
