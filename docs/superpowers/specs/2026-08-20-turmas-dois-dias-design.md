# Turmas com dois dias fixos — desenho

## Objetivo

Cada turma de Pilates passa a reunir dois dias fixos da semana, mantendo um único horário, duração e quantidade de vagas. Exemplo: segunda e quarta, às 08:00, 60 minutos e 4 vagas.

## Dados e migração

`ClassSlot` recebe o campo opcional `secondWeekday Int?`. O campo atual `weekday` continua sendo o primeiro dia para preservar todas as turmas existentes.

- Novas turmas exigem dois dias diferentes (`weekday` e `secondWeekday`).
- Turmas existentes recebem `secondWeekday = null`; nenhuma data será inferida automaticamente.
- A opção de completar o segundo dia ficará disponível para essas turmas na tela administrativa.

## Interface administrativa

O formulário de criação mantém os campos atuais:

- dia da semana;
- horário de início;
- duração da aula;
- número de vagas.

Ele passa a ter `Segundo dia da semana`, com validação para impedir repetição. A listagem mostra `Segunda-feira e Quarta-feira · 08:00 · 60 min · 4 vagas`.

Para uma turma antiga sem segundo dia, a listagem mostra um seletor `Completar segundo dia` e um botão de confirmação. O horário, duração e vagas não são modificados.

## Agenda

`materializeOccurrences` gera oito semanas de ocorrências para o primeiro dia e, quando presente, para o segundo dia. A unicidade existente por turma e início continua evitando duplicações. Ao completar o segundo dia de uma turma antiga, o sistema materializa as novas ocorrências desse dia.

## API e validação

- `POST /api/admin/class-slots` exige os dois dias para novas turmas.
- `PATCH /api/admin/class-slots/:id` aceita somente a inclusão do segundo dia em uma turma existente e materializa a agenda.
- Ambos os endpoints exigem administrador.
- Os dias são números inteiros de 0 a 6 e precisam ser diferentes.

## Testes

- Validação recusa dias repetidos e aceita dois dias distintos.
- Materialização cria ocorrências nos dois dias sem duplicar horários existentes.
- A rota de completar segundo dia rejeita sessão de aluno.
- Build e suíte completa permanecem verdes.
