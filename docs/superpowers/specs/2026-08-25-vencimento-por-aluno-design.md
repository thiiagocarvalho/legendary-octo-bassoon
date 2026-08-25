# Vencimento mensal definido por aluno

## Objetivo

Permitir que o administrador escolha, no cadastro ou na matrícula de cada aluno, a data de primeiro vencimento. O CRM reaplicará esse dia em todas as mensalidades futuras do aluno.

## Regra de vencimento

- O campo será um calendário chamado `Primeiro vencimento`.
- A data escolhida define o dia recorrente da matrícula. Exemplo: `10/09/2026` cria vencimentos no dia 10 de cada mês.
- Quando o mês não tiver o dia escolhido, será usado o último dia daquele mês.
- A competência da fatura continua sendo o mês da cobrança, enquanto `dueDate` recebe o dia calculado.
- Matrículas já existentes são dados de teste e receberão o dia da própria data de início; o administrador poderá alterá-lo ao refazer a matrícula.

## Dados

Adicionar `paymentDueDay Int` na matrícula (`Enrollment`), obrigatório e validado entre 1 e 31. Uma migração preencherá as matrículas de teste usando o dia de `startsAt` antes de tornar a coluna obrigatória.

## Fluxos

### Cadastro novo

O formulário de aluno terá o campo `Primeiro vencimento`. Quando plano e turma forem escolhidos, o cadastro grava a matrícula com esse dia.

### Matrícula de aluno existente

A área `Matrícula` passa a mostrar o calendário antes da escolha do plano. Ao confirmar, a nova matrícula guarda o dia selecionado e cria a primeira mensalidade naquela data.

### Mensalidade e pagamento manual

Ao gerar uma fatura, ao lançar pagamento antecipado ou ao completar competências pendentes, o sistema calcula o vencimento pela matrícula em vez de usar o primeiro dia do mês ou a data atual.

## Compatibilidade e segurança

- Faturas e pagamentos existentes não serão modificados.
- Apenas administradores continuam podendo configurar planos, matrículas e financeiro.
- Os alertas e links de WhatsApp passam a refletir a data calculada da fatura.

## Testes

- Cálculo para dias normais e para o último dia de fevereiro.
- Validação do dia de vencimento na criação e matrícula.
- Pagamento manual gera competências futuras com o dia configurado.
- A seleção de data aparece nos dois pontos de matrícula.
