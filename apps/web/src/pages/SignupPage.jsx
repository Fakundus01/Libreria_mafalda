import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';

function SignupPage() {
  const navigate = useNavigate();
  const { applySession, customerProfile } = useShop();
  const [form, setForm] = useState({
    full_name: customerProfile.name,
    email: customerProfile.email,
    phone: customerProfile.phone,
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/signup', form);
      applySession({ nextUser: res.user, nextToken: res.token });
      navigate('/profile');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="bg-[#fff2e6] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Registro</p>
            <h1 className="mt-3 font-display text-5xl leading-none text-ink">Crear cuenta cliente</h1>
            <p className="mt-4 text-sm leading-7 text-ink/68">El registro ya sale con tu mail y telefono cargados para testear rapido todo el circuito de compras y pedidos.</p>
          </Card>

          <Card className="p-8">
            <h2 className="font-display text-4xl text-ink">Completa tus datos</h2>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Nombre completo</label>
                <input className="input-field" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                <input className="input-field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Telefono</label>
                <input className="input-field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Contrasena</label>
                <input className="input-field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </div>
              {error ? <p className="text-sm text-berry">{error}</p> : null}
              <Button as="button" type="submit" disabled={loading} className="w-full bg-coral text-white">
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          </Card>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default SignupPage;
