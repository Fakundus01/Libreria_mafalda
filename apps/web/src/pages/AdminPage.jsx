import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
import StatusPill from '../components/StatusPill';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiGet, apiPatch, apiPost } from '../lib/api';
import { formatCurrency } from '../lib/format';

function AdminPage() {
  const { adminToken, logoutAdmin, setAdminToken } = useShop();
  const [form, setForm] = useState({ email: '', password: '' });
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [prints, setPrints] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (token = adminToken) => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, printsRes, metricsRes] = await Promise.all([
        apiGet('/api/admin/orders', { token }),
        apiGet('/api/admin/prints', { token }),
        apiGet('/api/admin/metrics', { token }),
      ]);
      setOrders(ordersRes.data || []);
      setPrints(printsRes.data || []);
      setMetrics(metricsRes.data || null);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar el panel admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadDashboard(adminToken);
    }
  }, [adminToken]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost('/api/admin/auth/login', form);
      setAdminToken(res.token);
      await loadDashboard(res.token);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesion admin.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderCode, status) => {
    try {
      await apiPatch(`/api/admin/orders/${orderCode}`, { status }, { token: adminToken });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar el pedido.');
    }
  };

  const updateTransfer = async (orderCode, status) => {
    try {
      await apiPatch(`/api/admin/payments/transfer/${orderCode}`, { status }, { token: adminToken });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la transferencia.');
    }
  };

  const updatePrint = async (printCode, status) => {
    try {
      await apiPatch(`/api/admin/prints/${printCode}`, { status }, { token: adminToken });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la impresion.');
    }
  };

  if (!adminToken) {
    return (
      <div className="overflow-hidden pb-6 text-ink">
        <Header site={siteConfig} />
        <main className="px-3 py-8 sm:py-10">
          <Container className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-ink p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Admin</p>
              <h1 className="mt-3 font-display text-5xl leading-none">Panel operativo</h1>
              <p className="mt-4 text-sm leading-7 text-white/75">Desde aca se revisan pedidos, pagos por transferencia, impresiones y metricas basicas del ecommerce.</p>
            </Card>
            <Card className="p-8">
              <h2 className="font-display text-4xl text-ink">Ingresar como admin</h2>
              <form className="mt-6 space-y-4" onSubmit={login}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                  <input className="input-field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Password</label>
                  <input className="input-field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                </div>
                {error ? <p className="text-sm text-berry">{error}</p> : null}
                <Button as="button" type="submit" disabled={loading} className="w-full bg-ink text-white">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </Card>
          </Container>
        </main>
        <Footer site={siteConfig} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Admin dashboard</p>
              <h1 className="mt-2 font-display text-5xl leading-none text-ink">Pedidos, pagos e impresiones</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="button" type="button" onClick={() => loadDashboard()} className="bg-ink text-white">Recargar</Button>
              <Button as="button" type="button" onClick={logoutAdmin} className="bg-white border border-stone-200 text-ink">Cerrar sesion</Button>
            </div>
          </div>

          {loading ? <PageLoader title="Actualizando panel" message="Estamos leyendo pedidos, impresiones y metricas." /> : null}
          {error ? <p className="mb-5 rounded-[24px] bg-white/85 p-5 text-sm text-berry">{error}</p> : null}

          {metrics ? (
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Ventas</p>
                <p className="mt-3 font-display text-5xl text-ink">{formatCurrency(metrics.total_sales)}</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pedidos</p>
                <p className="mt-3 font-display text-5xl text-ink">{metrics.orders_count}</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Ticket promedio</p>
                <p className="mt-3 font-display text-5xl text-ink">{formatCurrency(metrics.avg_ticket)}</p>
              </Card>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-4xl text-ink">Pedidos</h2>
              <div className="mt-4 grid gap-4">
                {orders.map((order) => (
                  <Card key={order.order_code} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-3xl text-ink">{order.order_code}</h3>
                        <p className="mt-2 text-sm text-ink/65">{order.customer_name} · {order.customer_email}</p>
                        <p className="mt-1 text-sm text-ink/65">{formatCurrency(order.total_amount)}</p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button as="button" type="button" onClick={() => updateOrder(order.order_code, 'PREPARING')} className="bg-ink text-white">Preparar</Button>
                      <Button as="button" type="button" onClick={() => updateOrder(order.order_code, 'COMPLETED')} className="bg-coral text-white">Completar</Button>
                      <Button as="button" type="button" onClick={() => updateTransfer(order.order_code, 'APPROVED')} className="bg-mint text-ink">Aprobar transferencia</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl text-ink">Impresiones</h2>
              <div className="mt-4 grid gap-4">
                {prints.map((item) => (
                  <Card key={item.print_code} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-3xl text-ink">{item.print_code}</h3>
                        <p className="mt-2 text-sm text-ink/65">{item.customer_name}</p>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button as="button" type="button" onClick={() => updatePrint(item.print_code, 'IN_PROGRESS')} className="bg-ink text-white">En proceso</Button>
                      <Button as="button" type="button" onClick={() => updatePrint(item.print_code, 'READY')} className="bg-coral text-white">Marcar lista</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default AdminPage;
