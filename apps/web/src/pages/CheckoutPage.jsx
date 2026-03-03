import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiPost } from '../lib/api';

function CheckoutPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', fulfillment_type: 'PICKUP', area: 'Villa Maipú', street: '', number: '', refs: '' });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const cart = useMemo(() => JSON.parse(localStorage.getItem('mafalda_cart') || '[]'), []);

  const submitOrder = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const orderPayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        fulfillment_type: form.fulfillment_type,
        items: cart.map((item) => ({ product_id: item.productId, qty: item.qty })),
      };
      if (form.fulfillment_type === 'DELIVERY') {
        orderPayload.delivery_address = {
          area: form.area,
          street: form.street,
          number: form.number,
          references: form.refs,
        };
      }

      const orderRes = await apiPost('/api/orders', orderPayload);
      const prefRes = await apiPost('/api/payments/mercadopago/create-preference', { order_id: orderRes.data.id });
      setResult(prefRes.data);
      localStorage.removeItem('mafalda_cart');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="bg-cream py-12">
      <Container className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h1 className="font-serif text-3xl">Checkout invitado</h1>
          <p className="mt-2 text-sm text-stone-600">Sin registro obligatorio. Completá tus datos y pagá con Mercado Pago.</p>

          <form onSubmit={submitOrder} className="mt-5 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Teléfono (opcional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className="w-full rounded-xl border px-3 py-2" value={form.fulfillment_type} onChange={(e) => setForm({ ...form, fulfillment_type: e.target.value })}>
              <option value="PICKUP">Retiro en local</option>
              <option value="DELIVERY">Envío (solo Villa Maipú)</option>
            </select>

            {form.fulfillment_type === 'DELIVERY' && (
              <>
                <input className="w-full rounded-xl border px-3 py-2" placeholder="Barrio/Área" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                <input className="w-full rounded-xl border px-3 py-2" placeholder="Calle" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                <input className="w-full rounded-xl border px-3 py-2" placeholder="Altura" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                <textarea className="w-full rounded-xl border px-3 py-2" placeholder="Referencias" value={form.refs} onChange={(e) => setForm({ ...form, refs: e.target.value })} />
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button as="button" type="submit" className="w-full bg-stone-900 text-cream">
              Confirmar y pagar
            </Button>
          </form>

          {result && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">
              <p>Preferencia creada: {result.preference_id}</p>
              <a className="underline" href={result.checkout_url} target="_blank" rel="noreferrer">
                Ir a pagar con Mercado Pago
              </a>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-serif text-2xl">Resumen</h2>
          {cart.length === 0 && (
            <p className="mt-3 text-sm text-stone-600">
              No hay productos en carrito. <Link className="underline" to="/shop">Ir a tienda</Link>
            </p>
          )}
          <ul className="mt-4 space-y-2">
            {cart.map((item) => (
              <li key={item.productId} className="flex items-center justify-between text-sm">
                <span>{item.title} x {item.qty}</span>
                <span>${item.price * item.qty}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </main>
  );
}

export default CheckoutPage;
