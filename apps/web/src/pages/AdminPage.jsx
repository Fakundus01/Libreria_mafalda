import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiPatch, apiPost } from '../lib/api';

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('mafalda_admin_token') || '');
  const [form, setForm] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [prints, setPrints] = useState([]);
  const [error, setError] = useState('');

  const login = async (event) => {
    event.preventDefault();
    try {
      const res = await apiPost('/api/admin/auth/login', form);
      setToken(res.token);
      localStorage.setItem('mafalda_admin_token', res.token);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const authedGet = async (path) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'No se pudo cargar. Intentá nuevamente.');
    return json;
  };

  const loadOrders = async () => {
    try {
      const json = await authedGet('/api/admin/orders');
      setOrders(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPrints = async () => {
    try {
      const json = await authedGet('/api/admin/prints');
      setPrints(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const setPreparing = async (orderCode) => {
    try {
      await apiPatch(`/api/admin/orders/${orderCode}`, { status: 'PREPARING' }, token);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <main className="bg-cream py-16">
        <Container className="max-w-md">
          <Card>
            <h1 className="font-serif text-3xl">Admin</h1>
            <form className="mt-5 space-y-3" onSubmit={login}>
              <input className="w-full rounded-xl border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button as="button" type="submit" className="w-full bg-stone-900 text-cream">Ingresar</Button>
            </form>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-cream py-10">
      <Container>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button as="button" onClick={loadOrders} className="bg-terracotta text-white">Cargar pedidos</Button>
          <Button as="button" onClick={loadPrints} className="bg-stone-900 text-cream">Cargar impresiones</Button>
        </div>
        {error && <p className="mb-3 text-red-600">{error}</p>}

        <h2 className="font-serif text-2xl">Pedidos</h2>
        <div className="mt-3 grid gap-3">
          {orders.map((order) => (
            <Card key={order.order_code}>
              <p className="font-semibold">Pedido {order.order_code} - {order.customer_name}</p>
              <p className="text-sm">Estado: {order.status}</p>
              <p className="text-sm">Total: ${order.total_amount}</p>
              <Button as="button" onClick={() => setPreparing(order.order_code)} className="mt-3 bg-stone-900 text-cream">Marcar PREPARING</Button>
            </Card>
          ))}
        </div>

        <h2 className="mt-8 font-serif text-2xl">Impresiones</h2>
        <div className="mt-3 grid gap-3">
          {prints.map((item) => (
            <Card key={item.print_code}>
              <p className="font-semibold">{item.print_code} - {item.customer_name}</p>
              <p className="text-sm">Estado: {item.status}</p>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}

export default AdminPage;
