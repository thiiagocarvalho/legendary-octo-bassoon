import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Meu Pilates', short_name: 'Pilates', start_url: '/aluno', display: 'standalone', background_color: '#f7faf7', theme_color: '#047857' };
}
