export function bookingChangeError(payload: unknown) {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && (payload as { error?: unknown }).error === 'MONTHLY_CHANGE_LIMIT_REACHED') {
    return 'Você já excedeu o limite de 2 mudanças mensais.';
  }
  return 'A alteração só pode ser feita com pelo menos 1 dia de antecedência.';
}
