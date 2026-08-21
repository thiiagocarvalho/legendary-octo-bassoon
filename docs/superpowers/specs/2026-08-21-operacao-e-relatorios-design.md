# Operação, reposições e relatórios

## Objetivo

Completar a operação diária do estúdio com controle de presença, reposições, avisos por WhatsApp sem API, relatórios e histórico automático por aluno.

## Presenças e faltas

A agenda administrativa continuará sendo o local para marcar cada reserva como presente ou falta. A ficha do aluno mostrará totais dos últimos 28 dias e a taxa de presença, calculada somente sobre aulas com status presente ou falta.

Cada alteração de presença, falta ou cancelamento criará uma entrada no histórico do aluno com data, responsável e descrição.

## Reposições

Uma falta pode gerar um crédito de reposição pelo administrador. Cada crédito terá aluno, origem da falta, status e datas de criação e uso.

O aluno verá no aplicativo quantos créditos estão disponíveis. Ao reservar uma aula de reposição, o sistema exigirá um crédito disponível, aplicará as mesmas regras de vagas da agenda e consumirá um único crédito. A reposição não altera a turma fixa, não cria novas vagas e não permite uma reserva em turma lotada.

## Avisos por WhatsApp

No financeiro e nos relatórios, alunos cuja mensalidade vence hoje, amanhã ou está em atraso terão um botão que abre `wa.me` em nova aba com uma mensagem pronta em português. O CRM não envia mensagens automaticamente e não usa API paga.

## Relatórios

Uma nova página de relatórios terá filtro por mês e apresentará receita recebida, mensalidades pendentes, lista de inadimplentes, ocupação das turmas, frequência por aluno e reposições pendentes/usadas no período. Cada aluno listado terá acesso à ficha e, quando aplicável, ao botão de WhatsApp.

## Histórico de alterações

O registro existente de auditoria será usado para registrar: criação e alteração de matrícula, mudança de turma, pagamento confirmado, presença, falta, cancelamento, criação e uso de reposição, alterações de prontuário e evolução funcional. A ficha do aluno exibirá somente os eventos desse aluno.

## Dados e permissões

Novas entidades de reposição se relacionarão ao aluno e, opcionalmente, à reserva de origem e à reserva usada. Somente administradores podem criar ou cancelar créditos e consultar relatórios. Alunos podem visualizar os próprios créditos e usá-los somente por meio da agenda autenticada.

## Tratamento de erros

Tentativas de usar crédito inexistente, duplicar a reposição de uma falta, reservar sem vaga ou fora das regras de troca retornarão mensagem clara sem modificar reservas ou créditos. Falhas no WhatsApp não afetam os dados do CRM porque o botão apenas abre um link externo.

## Verificação

Serão incluídos testes unitários para regras de crédito e cálculo de relatórios, testes de rota para criação/uso de reposição e compilação completa do projeto após as migrações.
