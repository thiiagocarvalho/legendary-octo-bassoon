# Cobrança manual para o Pilates Gestão

## Objetivo

Substituir a cobrança online por controle financeiro presencial. O administrador confirma cada recebimento e informa a forma de pagamento e a quantidade de meses quitados. O aluno não efetua pagamentos pelo CRM.

## Escopo aprovado

- Remover integração Mercado Pago, checkout, webhook e variáveis de ambiente associadas.
- Registrar pagamentos manuais somente como `Pix`, `Dinheiro` ou `Cartão presencial`.
- Cada registro guarda aluno/matrícula, valor recebido, quantidade de meses, data, observação opcional e administrador responsável.
- Um pagamento quita mensalidades em ordem cronológica: primeiro pendências/atrasos existentes e depois competências futuras consecutivas.
- Quando faltarem competências para cobrir a quantidade informada, elas são geradas usando o preço vigente do plano.
- Após a confirmação, a matrícula fica ou permanece ativa.
- O aluno vê mensalidades pagas ou pendentes, sem botão, checkout ou dados de recebimento.
- O administrador vê recebimentos registrados, forma de pagamento, meses quitados, valor e histórico de auditoria.

## Modelo de dados

Adicionar:

```prisma
enum ManualPaymentMethod {
  PIX
  CASH
  CARD_IN_PERSON
}

model ManualPayment {
  id             String              @id @default(cuid())
  enrollmentId   String
  method         ManualPaymentMethod
  amountCents    Int
  monthsCovered  Int
  receivedAt     DateTime
  notes          String?
  receivedBy     String
  invoices       ManualPaymentInvoice[]
  createdAt      DateTime            @default(now())
  enrollment     Enrollment          @relation(fields: [enrollmentId], references: [id])
}

model ManualPaymentInvoice {
  paymentId String
  invoiceId String
  payment   ManualPayment @relation(fields: [paymentId], references: [id])
  invoice   Invoice       @relation(fields: [invoiceId], references: [id])
  @@id([paymentId, invoiceId])
}
```

Remover de `Invoice`: `checkoutUrl` e `externalId`.

## Fluxo de confirmação

1. O administrador abre Financeiro e escolhe o aluno/matrícula.
2. Informa a forma de recebimento, quantidade de meses, valor total e observação opcional.
3. O serviço busca faturas `PENDING` ou `OVERDUE` da matrícula em ordem de competência.
4. Ele cria faturas futuras suficientes, quando necessário, e marca exatamente a quantidade de competências como `PAID`.
5. O serviço cria o recibo manual, relaciona as faturas quitadas e registra `AuditLog`.
6. A matrícula é atualizada para `ACTIVE`.

O fluxo ocorre em uma transação, para impedir recibos parciais ou competência duplicada.

## Interfaces

### Administração

- Financeiro passa a ter formulário de recebimento manual.
- Lista de mensalidades mostra estado e competência.
- Lista de recebimentos mostra forma, valor, meses e responsável.

### Portal do aluno

- Remove o botão de pagamento.
- Mostra faturas com estado, competência e vencimento.

## Remoções

- `server/payments/`;
- rota de checkout do aluno;
- rota de webhook;
- dependência Mercado Pago;
- variáveis Mercado Pago e `APP_URL`;
- instruções de webhook e checkout na documentação.

## Regras e falhas

- A quantidade de meses é inteira, entre 1 e 24.
- O valor precisa ser positivo; o sistema mostra o valor esperado antes da confirmação, mas preserva o valor efetivamente recebido informado pelo administrador.
- Reenviar a mesma ação cria um novo recibo intencional; o operador deve conferir o resumo antes de confirmar.
- O aluno não possui endpoint para criar ou alterar recebimentos.
- Dados do recibo ficam disponíveis apenas ao administrador.

## Testes

- Unitário: validação da forma de pagamento, meses e regra de seleção cronológica de competências.
- Serviço: pagamento de múltiplos meses cria faturas futuras sem duplicação e ativa a matrícula.
- Autorização: aluno não pode criar pagamento manual nem ver recibos administrativos.
- Regressão: portal do aluno não contém checkout nem referências ao Mercado Pago.
