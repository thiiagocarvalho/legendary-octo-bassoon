export function prismaDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) return undefined;

  const url = new URL(databaseUrl);
  if (!url.hostname.endsWith('.pooler.supabase.com')) return databaseUrl;

  url.searchParams.set('pgbouncer', 'true');
  url.searchParams.set('connection_limit', '1');
  return url.toString();
}
