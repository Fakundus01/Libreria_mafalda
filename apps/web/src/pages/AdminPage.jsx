import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';

function AdminPage() {
  const navigate = useNavigate();
  const { adminReady, isAdminAuthenticated, applyAdminSession, refreshAdminSession } = useShop();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (adminReady && isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginResponse = await apiPost('/api/admin/auth/login', form);
      const nextAdminUser = loginResponse.user || await refreshAdminSession();
      applyAdminSession({ nextAdminUser });
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesion admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-ink p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Admin</p>
            <h1 className="mt-3 font-display text-5xl leading-none">Centro de control del ecommerce</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Desde aca se administran productos, pedidos, clientes, mensajes, impresiones y la operacion general.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-white/75">
              <p>Dashboard con metricas de ventas y actividad.</p>
              <p>Gestion completa de productos, stock, precios e imagenes.</p>
              <p>Seguimiento de pedidos, clientes y mensajes desde un solo lugar.</p>
            </div>
          </Card>

          <Card className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Acceso restringido</p>
            <h2 className="mt-2 font-display text-4xl text-ink">Ingresar como admin</h2>
            <form className="mt-6 space-y-4" onSubmit={login}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                <input
                  className="input-field"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink/80">Password</label>
                <input
                  className="input-field"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </div>
              {error ? <p className="rounded-[20px] bg-berry/10 px-4 py-3 text-sm text-berry">{error}</p> : null}
              <Button as="button" type="submit" disabled={loading} className="w-full bg-ink text-white">
                {loading ? 'Ingresando...' : 'Entrar al panel'}
              </Button>
            </form>
          </Card>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default AdminPage;
