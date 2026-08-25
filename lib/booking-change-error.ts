export function bookingChangeError(payload: unknown) {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && (payload as { error?: unknown }).error === 'MONTHLY_CHANGE_LIMIT_REACHED') {
    return 'Você já excedeu o limite de 2 mudanças mensais.';
  }
  return 'Não foi possível trocar: verifique a vaga, o plano e o prazo de 2 horas.';
}
