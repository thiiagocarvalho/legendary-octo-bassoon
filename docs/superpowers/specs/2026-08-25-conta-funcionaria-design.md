# Conta de Funcionária sem acesso financeiro

## Objetivo

Permitir que o estúdio tenha uma conta de funcionária/recepção independente da conta de administrador. A funcionária executa a rotina operacional sem visualizar valores, planos, pagamentos ou relatórios financeiros.

## Papéis

| Recurso | Administrador | Funcionária |
| --- | --- | --- |
| Painel operacional | Sim, com métricas financeiras | Sim, sem métricas financeiras |
| Alunos | Gerenciar integralmente | Consultar e atualizar dados básicos |
| Turmas, agenda, chamada e remarcações | Sim | Sim |
| Financeiro, Planos e Relatórios | Sim | Não |
| Mensalidades, pagamentos e cobranças | Sim | Não |
| Matrículas e preço de planos | Sim | Não |
| Excluir/arquivar alunos, turmas e planos | Sim | Não |
| Criar e gerenciar contas de funcionária | Sim | Não |

## Dados e segurança

- O papel `EMPLOYEE` será incluído no modelo de usuários por uma migração Prisma.
- O login existente de administrador não muda.
- As páginas e APIs financeiras exigem papel `ADMIN`; a funcionária recebe resposta 403 mesmo acessando a URL diretamente.
- O painel e as APIs operacionais serão ajustados para aceitar `ADMIN` ou `EMPLOYEE`, mas o retorno do painel para funcionária não terá receita prevista, receita recebida ou dados de pagamentos.
- Telas de alunos para funcionária não recebem preços ou detalhes de matrícula financeira.
- A navegação será construída a partir do papel da sessão, para não mostrar Financeiro, Planos, Relatórios ou equipe à funcionária.

## Fluxos

### Administrador

1. Acessa `Equipe` no menu administrativo.
2. Cadastra nome, e-mail e senha da funcionária.
3. A funcionária usa esse e-mail e senha próprios no login normal.

### Funcionária

1. Entra no CRM com a própria conta.
2. Vê somente Painel, Alunos, Turmas, Agenda, Lista de chamada e Remarcações.
3. Não vê valores monetários nem links financeiros.
4. Ao abrir um link financeiro salvo, recebe a mensagem de acesso restrito.

## Implementação

1. Migrar o enum `Role` e atualizar os tipos de sessão.
2. Criar verificações reutilizáveis: acesso operacional e acesso financeiro/administrativo.
3. Proteger páginas e APIs por papel, sem depender somente da interface.
4. Adaptar as consultas do painel e das fichas de alunos para omitir valores da funcionária.
5. Adicionar a página administrativa de equipe para criação de contas de funcionária.
6. Cobrir permissões, menus e proteção das APIs com testes.

## Fora de escopo

- A funcionária não pode recuperar ou alterar a senha do administrador.
- Não haverá permissões personalizadas por funcionária nesta primeira versão.
- Não serão apagados dados existentes nem alteradas contas de alunos.
