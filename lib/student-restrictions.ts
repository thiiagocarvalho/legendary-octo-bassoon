export function studentRestrictionsSummary(restrictions: string | null | undefined) {
  const value = restrictions?.trim();
  return value || 'Nenhuma restrição registrada.';
}
