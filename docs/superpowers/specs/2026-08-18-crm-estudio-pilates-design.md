# CRM para Estúdio de Pilates — desenho do MVP

## Objetivo

Criar uma aplicação web responsiva e instalável no celular (PWA) para operar um estúdio de Pilates. O sistema terá duas áreas: administração do estúdio e portal do aluno. O MVP substitui controles manuais de agenda, mensalidade e acompanhamento, sem tentar reproduzir os recursos de uma academia completa.

## Escopo aprovado

### Administração do estúdio

- Cadastrar e editar alunos, incluindo contato, data de nascimento e situação do plano.
- Criar o plano mensal `2 aulas por semana`.
- Configurar turmas recorrentes com dia, horário e capacidade máxima.
- Visualizar agenda e registrar presença, falta ou cancelamento.
- Consultar pagamentos, pendências e inadimplência.
- Registrar ficha de restrições, objetivos e evolução clínica/funcional do aluno.
- Receber alertas de aniversariantes, vencimentos, inadimplência, baixa frequência e ausência de agendamento na semana.
- Acompanhar indicadores de alunos ativos, receita, inadimplência, ocupação e frequência.

### Portal do aluno

- Entrar com conta própria em uma interface web responsiva, que pode ser instalada como atalho na tela inicial.
- Consultar sua agenda, plano, histórico de aulas e situação financeira.
- Reservar, trocar ou cancelar aulas, desde que a alteração seja feita ao menos duas horas antes do início.
- Pagar a mensalidade online por Pix ou cartão.

O aluno não vê registros clínicos, restrições ou evolução funcional.

## Decisões de produto

O acesso é limitado a dois papéis: `administrador` e `aluno`. Não haverá área de instrutor no MVP.

O plano vendido inicialmente é mensal e permite no máximo duas reservas com presença por semana. A cobrança é recorrente; o status de pagamento deve ser atualizado por retorno assinado do provedor de pagamento. A integração será isolada por uma interface de pagamentos, permitindo escolher ou trocar o provedor brasileiro sem alterar contratos, agenda ou portal.

Cada reserva precisa pertencer a uma turma, aluno e semana de referência. Ao trocar uma aula, o sistema só remove a reserva original depois de confirmar que existe vaga na nova turma. Cancelamentos e trocas são bloqueados duas horas antes do horário da turma. O administrador pode fazer ajustes manuais, preservando o motivo e o histórico.

## Arquitetura

Uma aplicação web única contém:

1. **Interface administrativa** para a operação do estúdio.
2. **Portal do aluno/PWA** para agenda e pagamentos em celular.
3. **API de domínio** que aplica regras de planos, vagas, frequência e permissões.
4. **Banco de dados relacional** para usuários, agenda, pagamentos e histórico clínico.
5. **Adaptador de pagamento** para criar cobranças Pix/cartão e receber confirmações por webhook.
6. **Serviço de notificações** para alertas no painel e, futuramente, e-mail/WhatsApp.

As interfaces usam a mesma API; autenticação e autorização são verificadas em todo endpoint. A API não entrega dados de saúde para sessões de aluno.

## Modelo de dados essencial

- `User`: credenciais, papel e estado de acesso.
- `Student`: perfil, matrícula, contato, data de nascimento e vínculo com usuário.
- `HealthProfile`: consentimento, restrições, objetivos e observações; vinculado a um aluno.
- `FunctionalProgress`: registro datado de avaliação/evolução, criado exclusivamente pelo administrador.
- `Plan`: nome, preço, recorrência mensal e limite semanal de duas aulas.
- `Enrollment`: aluno, plano, início, fim, estado e regra de renovação.
- `ClassSlot`: turma recorrente, dia, horário, capacidade e estado.
- `Booking`: aluno, ocorrência da turma, estado (reservada, cancelada, presente, falta), origem e histórico de alteração.
- `Invoice` e `Payment`: valor, vencimento, estado, método, referência do provedor e eventos recebidos.
- `AuditLog`: alterações administrativas sensíveis, incluindo data, autor e motivo quando aplicável.

## Privacidade e segurança

Restrições e evolução clínica/funcional são dados sensíveis. O MVP deve coletar consentimento explícito antes do primeiro registro e limitar sua leitura e alteração ao administrador. Cada alteração deve manter data, autor e histórico, sem sobrescrever registros anteriores. Essas notas são de acompanhamento do estúdio, não de diagnóstico médico.

Senhas serão armazenadas apenas por hash seguro. Pagamentos serão processados pelo provedor; o sistema não armazena dados brutos de cartão. Webhooks só são aceitos após validação da assinatura. O sistema expõe ao aluno somente seus próprios dados operacionais e financeiros.

## Fluxos principais

### Matrícula e pagamento

O administrador cadastra o aluno e sua matrícula. A aplicação cria uma cobrança recorrente no provedor de pagamentos. Quando o provedor confirma o pagamento, a fatura passa a paga e a matrícula fica ativa. Em vencimento sem pagamento, ela fica pendente/atrasada e dispara alerta no painel.

### Reserva e troca

O aluno escolhe uma ocorrência futura. A API verifica plano ativo, limite semanal, capacidade e antecedência mínima. Ao trocar, verifica primeiro a nova vaga e só então libera a antiga. Ação fora da janela de duas horas recebe mensagem clara e não altera a reserva.

### Presença e acompanhamento

O administrador registra presença ou falta na agenda. A frequência do aluno e os indicadores do painel são recalculados. Em seguida, quando necessário, registra uma evolução funcional datada na ficha privada do aluno.

## Falhas esperadas e tratamento

- Vaga preenchida simultaneamente: a confirmação é atômica; o aluno recebe aviso para escolher outro horário.
- Plano inativo ou limite semanal atingido: a reserva é recusada com a razão apresentada.
- Pagamento pendente ou falha do provedor: a fatura permanece pendente; nenhuma ativação é feita por suposição.
- Webhook duplicado: processamento idempotente, sem duplicar pagamentos ou renovação.
- Acesso indevido a ficha clínica: a API retorna acesso negado e registra a tentativa quando aplicável.

## Indicadores do MVP

- alunos ativos;
- aniversariantes do dia e da semana;
- mensalidades a vencer, pendentes e atrasadas;
- receita recebida e prevista;
- ocupação por turma;
- presença, faltas e frequência por aluno;
- alunos sem reserva na semana e com queda de frequência.

## Fora do escopo do MVP

- área de instrutores;
- treinos, vídeos, WOD, carga ou recordes;
- catraca, biometria e totem;
- comunidade entre alunos;
- campanhas comerciais completas, IA por WhatsApp, programa de recompensas e NPS;
- emissão de nota fiscal, antecipação de recebíveis e gestão completa de despesas;
- aplicativos nativos para iOS e Android.

Esses itens permanecem candidatos a fases futuras.

## Estratégia de testes

- Testes unitários para limite de duas aulas semanais, capacidade, janela de duas horas e permissões.
- Testes de integração para criação de cobrança e processamento idempotente de webhooks.
- Testes de ponta a ponta para matrícula, reserva, troca, cancelamento, presença e pagamento.
- Testes de autorização que garantam que uma sessão de aluno não lê nem altera informações clínicas.
- Testes responsivos para o portal do aluno em telas de celular.
