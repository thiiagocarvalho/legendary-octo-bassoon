# Turmas com dois dias fixos — desenho

## Objetivo

Cada turma de Pilates passa a reunir dois dias fixos da semana, mantendo um único horário, duração e quantidade de vagas. Exemplo: segunda e quarta, às 08:00, 60 minutos e 4 vagas.

## Dados e migração

`ClassSlot` recebe o campo opcional `secondWeekday Int?`. O campo atual `weekday` continua sendo o primeiro dia para preservar todas as turmas existentes.

- Novas turmas usam uma das duas combinações fixas: `Segunda e Quarta` ou `Terça e Quinta`.
- Turmas existentes recebem `secondWeekday = null`; nenhuma data será inferida automaticamente.
- A opção de completar o segundo dia ficará disponível para essas turmas na tela administrativa.

## Interface administrativa

O formulário de criação mantém os campos atuais:

- dias da turma;
- horário de início;
- duração da aula;
- número de vagas.

Ele passa a ter dois botões exclusivos para a escolha dos dias: `Segunda e Quarta` e `Terça e Quinta`. A listagem mostra `Segunda-feira e Quarta-feira · 08:00 · 60 min · 4 vagas`.

Para uma turma antiga sem segundo dia, a listagem mostra os mesmos dois botões de combinação e um botão de confirmação. O horário, duração e vagas não são modificados.

## Agenda

`materializeOccurrences` gera oito semanas de ocorrências para o primeiro dia e, quando presente, para o segundo dia. A unicidade existente por turma e início continua evitando duplicações. Ao completar o segundo dia de uma turma antiga, o sistema materializa as novas ocorrências desse dia.

## API e validação

- `POST /api/admin/class-slots` recebe uma combinação predefinida e grava os dois dias correspondentes.
- `PATCH /api/admin/class-slots/:id` aceita somente a combinação compatível com o primeiro dia já existente e materializa a agenda.
- Ambos os endpoints exigem administrador.
- As únicas combinações permitidas são segunda/quarta (`1`/`3`) e terça/quinta (`2`/`4`).

## Testes

- Validação aceita somente as duas combinações previstas.
- Materialização cria ocorrências nos dois dias sem duplicar horários existentes.
- A rota de completar segundo dia rejeita sessão de aluno.
- Build e suíte completa permanecem verdes.
