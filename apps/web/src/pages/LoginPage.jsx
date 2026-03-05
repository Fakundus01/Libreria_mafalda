import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';

function LoginPage() {
  const navigate = useNavigate();
  const { applySession, customerProfile } = useShop();
  const [form, setForm] = useState({ email: customerProfile.email, password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/login', form);
      applySession({ nextUser: res.user, nextToken: res.token });
      navigate('/profile');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-ink p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Cuenta cliente</p>
            <h1 className="mt-3 font-display text-5xl leading-none">Ingresar</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">Con tu cuenta podes ver pedidos, usar tus datos guardados y repetir compras sin reescribir todo.</p>
            <div className="mt-8 rounded-[28px] bg-white/10 p-5 text-sm text-white/75">
              <p className="font-semibold text-white">Dato de prueba sugerido</p>
              <p className="mt-2 break-all">{customerProfile.email}</p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="font-display text-4xl text-ink">Entrar a tu cuenta</h2>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                <input className="input-field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Contrasena</label>
                <input className="input-field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </div>
              {error ? <p className="text-sm text-berry">{error}</p> : null}
              <Button as="button" type="submit" disabled={loading} className="w-full bg-ink text-white">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <p className="text-sm text-ink/65">Todavia no tenes cuenta. <Link className="font-semibold text-coral" to="/signup">Crear cuenta</Link></p>
            </form>
          </Card>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default LoginPage;
