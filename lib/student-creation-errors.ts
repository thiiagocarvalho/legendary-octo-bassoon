type ErrorWithIssues = { issues?: Array<{ message?: string }> };
type ErrorWithCode = { code?: string };

export function studentCreationErrorMessage(error: unknown) {
  const issue = (error as ErrorWithIssues).issues?.[0]?.message;
  if (issue) return issue;
  if ((error as ErrorWithCode).code === 'P2002') return 'Já existe um acesso com este e-mail.';
  return 'Não foi possível cadastrar o aluno.';
}
