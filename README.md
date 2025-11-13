# Projeto Eventos - API de Usuários

API desenvolvida em JavaScript (Node.js) com Express e PostgreSQL para gerenciamento de eventos.

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## 🚀 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure o banco de dados PostgreSQL:**
   - Crie um banco de dados chamado `projeto_eventos` (ou use outro nome e atualize o .env)
   - Execute os scripts SQL na seguinte ordem:
     ```bash
     # Criar tabela de usuários
     psql -U postgres -d projeto_eventos -f create_table.sql
     
     # Criar tabelas de inscrições e presenças
     psql -U postgres -d projeto_eventos -f create_inscricoes_presencas_table.sql
     ```
   Ou execute o conteúdo dos arquivos SQL no seu cliente PostgreSQL (pgAdmin, DBeaver, etc.)
   
   **Importante:** Para testar a API de presenças, você precisará ter inscrições cadastradas. Você pode usar o script `insert_example_inscricoes.sql` após criar usuários.

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```
   - Edite o arquivo `.env` com suas credenciais do PostgreSQL:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=projeto_eventos
   DB_PASSWORD=sua_senha_aqui
   DB_PORT=5432
   PORT=3000
   ```

## 🏃 Como executar

```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Documentação Swagger

A API possui documentação interativa completa usando Swagger. Após iniciar o servidor, acesse:

**URL da Documentação:** `http://localhost:3000/api-docs`

Na documentação Swagger você pode:
- ✅ Ver todos os endpoints disponíveis
- ✅ Ver exemplos de requisições e respostas
- ✅ Testar a API diretamente na interface
- ✅ Ver todos os schemas e modelos de dados
- ✅ Entender as validações e códigos de resposta

### Como usar o Swagger:

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Acesse `http://localhost:3000/api-docs` no seu navegador

3. Expanda o endpoint desejado (ex: **POST /api/usuarios**)

4. Clique em **"Try it out"**

5. Preencha os dados no exemplo JSON ou edite conforme necessário

6. Clique em **"Execute"** para fazer a requisição

7. Veja a resposta da API diretamente na interface

## 📡 Endpoints da API

### POST /api/usuarios

Cria um novo usuário no sistema.

**URL:** `http://localhost:3000/api/usuarios`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "cpf": "12345678901",
  "data_nascimento": "1990-05-15",
  "senha": "senha123"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "cpf": "12345678901",
    "data_nascimento": "1990-05-15",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Todos os campos são obrigatórios: nome, email, cpf, data_nascimento, senha"
}
```

**Resposta de Erro - Senha Fraca (400):**
```json
{
  "success": false,
  "message": "A senha deve conter no mínimo 6 caracteres"
}
```

**Resposta de Erro (409):**
```json
{
  "success": false,
  "message": "E-mail já cadastrado no sistema"
}
```

### POST /api/auth

Autentica um usuário no sistema validando e-mail e senha.

**URL:** `http://localhost:3000/api/auth`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "joao.silva@email.com",
  "senha": "senha123"
}
```

**Resposta de Sucesso (200) - Autenticação Autorizada:**
```json
{
  "success": true,
  "message": "Usuário autenticado com sucesso",
  "authorized": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "cpf": "12345678901",
    "data_nascimento": "1990-05-15",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (401) - Não Autorizado:**
```json
{
  "success": false,
  "message": "E-mail ou senha incorretos",
  "authorized": false
}
```

**Resposta de Erro (400) - Campos Obrigatórios:**
```json
{
  "success": false,
  "message": "E-mail e senha são obrigatórios",
  "authorized": false
}
```

### POST /api/presencas

Confirma a presença de um usuário baseado no ID da inscrição.

**URL:** `http://localhost:3000/api/presencas`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "inscricao_id": 1
}
```

**Resposta de Sucesso (200) - Presença Confirmada:**
```json
{
  "success": true,
  "message": "Presença confirmada com sucesso",
  "presenca_confirmada": true,
  "data": {
    "id": 1,
    "inscricao_id": 1,
    "confirmada": true,
    "data_presenca": "2024-01-15T14:30:00.000Z"
  }
}
```

**Resposta de Erro (404) - Inscrição Não Encontrada:**
```json
{
  "success": false,
  "message": "Inscrição não encontrada",
  "presenca_confirmada": false
}
```

**Resposta de Erro (409) - Presença Já Confirmada:**
```json
{
  "success": false,
  "message": "Presença já confirmada para esta inscrição",
  "presenca_confirmada": false
}
```

**Resposta de Erro (400) - ID Obrigatório:**
```json
{
  "success": false,
  "message": "ID da inscrição é obrigatório",
  "presenca_confirmada": false
}
```

## 🧪 Testando no Postman

1. **Crie uma nova requisição:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/usuarios`
   - Headers: Adicione `Content-Type: application/json`
   - Body: Selecione `raw` e `JSON`, então cole:
   ```json
   {
     "nome": "Maria Santos",
     "email": "maria.santos@email.com",
     "cpf": "98765432100",
     "data_nascimento": "1985-03-20",
     "senha": "senhaSegura123"
   }
   ```

2. **Clique em Send**

3. **Você deve receber uma resposta com status 201 e os dados do usuário criado**

### Testando Autenticação no Postman:

1. **Crie uma nova requisição:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/auth`
   - Headers: Adicione `Content-Type: application/json`
   - Body: Selecione `raw` e `JSON`, então cole:
   ```json
   {
     "email": "maria.santos@email.com",
     "senha": "senhaSegura123"
   }
   ```

2. **Clique em Send**

3. **Você deve receber uma resposta com status 200 e os dados do usuário autenticado se as credenciais estiverem corretas, ou status 401 se estiverem incorretas**

### Testando Presenças no Postman:

1. **Primeiro, certifique-se de ter inscrições cadastradas no banco de dados:**
   - Execute o script `create_inscricoes_presencas_table.sql` para criar as tabelas
   - Execute o script `insert_example_inscricoes.sql` para inserir inscrições de exemplo (ajuste os IDs)

2. **Crie uma nova requisição:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/presencas`
   - Headers: Adicione `Content-Type: application/json`
   - Body: Selecione `raw` e `JSON`, então cole:
   ```json
   {
     "inscricao_id": 1
   }
   ```

3. **Clique em Send**

4. **Você deve receber uma resposta com status 200 e confirmação da presença se a inscrição existir, ou status 404 se não existir**

## 📝 Estrutura do Projeto

```
ProjetoEventos/
├── config/
│   ├── database.js          # Configuração da conexão com PostgreSQL
│   └── swagger.js           # Configuração do Swagger/OpenAPI
├── routes/
│   ├── usuarios.js          # Rotas da API de usuários (com documentação Swagger)
│   ├── auth.js               # Rotas de autenticação (com documentação Swagger)
│   └── presencas.js          # Rotas de presenças (com documentação Swagger)
├── create_table.sql         # Script SQL para criar a tabela de usuários
├── add_senha_column.sql     # Script SQL para adicionar coluna senha (se já criou a tabela)
├── create_inscricoes_presencas_table.sql  # Script SQL para criar tabelas de inscrições e presenças
├── insert_example_inscricoes.sql          # Script SQL para inserir inscrições de exemplo
├── server.js                # Servidor Express principal (com Swagger UI)
├── package.json             # Dependências do projeto
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md                # Documentação
```

## 🔍 Validações Implementadas

- Todos os campos são obrigatórios (nome, email, cpf, data_nascimento, senha)
- Validação de formato de e-mail
- Validação de CPF (11 dígitos)
- Validação de data de nascimento
- Validação de senha (mínimo 6 caracteres)
- Verificação de e-mail único
- Verificação de CPF único
- CPF é automaticamente limpo (remove caracteres não numéricos)
- Senha é armazenada com hash bcrypt (nunca em texto plano)

## 📌 Notas

- O campo `id` é gerado automaticamente pelo banco de dados (SERIAL)
- O CPF é armazenado sem formatação (apenas números)
- A data de nascimento deve estar no formato `YYYY-MM-DD`
- A senha é criptografada usando bcrypt antes de ser armazenada no banco
- A senha nunca é retornada nas respostas da API por segurança
- Os campos `created_at` e `updated_at` são gerenciados automaticamente

## 🔐 Segurança

- Senhas são hasheadas usando bcrypt com 10 salt rounds
- A senha nunca é retornada nas respostas da API
- Recomenda-se usar HTTPS em produção

## 📖 Documentação Swagger

A documentação Swagger está disponível em `/api-docs` e inclui:

- **Esquemas completos** de requisição e resposta
- **Múltiplos exemplos** para cada endpoint
- **Códigos de status HTTP** e suas descrições
- **Validações** e regras de negócio documentadas
- **Interface interativa** para testar a API diretamente

### Recursos do Swagger:

- ✅ Teste direto da API sem precisar do Postman
- ✅ Exemplos pré-configurados para facilitar testes
- ✅ Documentação sempre atualizada (baseada no código)
- ✅ Interface visual e intuitiva
- ✅ Exportação de especificação OpenAPI (JSON/YAML)

