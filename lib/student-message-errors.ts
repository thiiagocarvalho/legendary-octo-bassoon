export function studentMessageError(payload: unknown) {
  if (
    payload
    && typeof payload === 'object'
    && 'error' in payload
    && typeof payload.error === 'string'
    && payload.error.trim()
  ) {
    return payload.error;
  }

  return 'Não foi possível enviar a mensagem. Tente novamente.';
}
