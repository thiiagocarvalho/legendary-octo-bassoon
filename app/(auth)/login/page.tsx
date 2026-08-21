import { LoginForm } from '../../../components/auth/login-form';
import { PilatesProBrand } from '../../../components/brand/pilates-pro-brand';

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center p-6">
      <section className="w-full rounded-2xl bg-white p-7 shadow-sm">
        <div className="mb-4"><PilatesProBrand/></div>
        <h1 className="mb-6 text-2xl font-bold">Acesse sua conta</h1>
        <LoginForm />
      </section>
    </main>
  );
}
