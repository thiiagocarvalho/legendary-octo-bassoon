import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';

export default async function StartPage() {
  const user = await getSessionUser();

  if (!user) redirect('/login');
  redirect(user.role === 'ADMIN' ? '/admin' : '/aluno');
}
