import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';
import { formatCurrency } from '../lib/format';

function buildInitialForm(profile) {
  return {
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    fulfillment_type: 'PICKUP',
    area: profile.area || 'Villa Maipu',
    street: profile.street || '',
    number: profile.number || '',
    refs: profile.refs || '',
  };
}

function validate(form) {
  const nextErrors = {};

  if (!form.name.trim()) nextErrors.name = 'Ingresa un nombre.';
  if (!form.email.includes('@')) nextErrors.email = 'Ingresa un email valido.';
  if (form.fulfillment_type === 'DELIVERY') {
    if (!form.area.trim()) nextErrors.area = 'Ingresa el area de entrega.';
    if (!form.street.trim()) nextErrors.street = 'Ingresa la calle.';
    if (!form.number.trim()) nextErrors.number = 'Ingresa la altura.';
  }

  return nextErrors;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, customerProfile } = useShop();
  const [form, setForm] = useState(() => buildInitialForm(customerProfile));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setForm(buildInitialForm(customerProfile));
  }, [customerProfile]);

  const itemsCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);

  const buildOrderPayload = () => {
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

    return orderPayload;
  };

  const processOrder = async (mode) => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setError('');
    setResult(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const orderRes = await apiPost('/api/orders', buildOrderPayload());

      if (mode === 'mercadopago') {
        const prefRes = await apiPost('/api/payments/mercadopago/create-preference', { order_id: orderRes.data.id });
        clearCart();
        setResult(prefRes.data);
        return;
      }

      const transfer = await apiPost('/api/payments/transfer/create', { order_code: orderRes.data.order_code });
      clearCart();
      navigate(transfer.data.redirect_url);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo crear la compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <Card className="p-7 sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Checkout</p>
                  <h1 className="mt-3 font-display text-5xl leading-none text-ink">Compra lista para salir</h1>
                </div>
                <div className="rounded-[24px] bg-[#fff4df] px-4 py-3 text-sm text-ink/75">
                  <p className="font-semibold text-ink">Datos de prueba precargados</p>
                  <p>{customerProfile.email}</p>
                  <p>{customerProfile.phone}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Nombre</label>
                  <input className="input-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                  {errors.name ? <p className="mt-2 text-sm text-berry">{errors.name}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                  <input className="input-field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  {errors.email ? <p className="mt-2 text-sm text-berry">{errors.email}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Telefono</label>
                  <input className="input-field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Entrega</label>
                  <select className="select-field" value={form.fulfillment_type} onChange={(event) => setForm({ ...form, fulfillment_type: event.target.value })}>
                    <option value="PICKUP">Retiro en local</option>
                    <option value="DELIVERY">Envio en Villa Maipu</option>
                  </select>
                </div>
              </div>

              {form.fulfillment_type === 'DELIVERY' ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80">Area</label>
                    <input className="input-field" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} />
                    {errors.area ? <p className="mt-2 text-sm text-berry">{errors.area}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80">Calle</label>
                    <input className="input-field" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} />
                    {errors.street ? <p className="mt-2 text-sm text-berry">{errors.street}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80">Altura</label>
                    <input className="input-field" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
                    {errors.number ? <p className="mt-2 text-sm text-berry">{errors.number}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80">Referencias</label>
                    <input className="input-field" value={form.refs} onChange={(event) => setForm({ ...form, refs: event.target.value })} />
                  </div>
                </div>
              ) : null}

              {error ? <p className="mt-5 text-sm text-berry">{error}</p> : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button as="button" type="button" disabled={loading} onClick={() => processOrder('mercadopago')} className="w-full bg-ink text-white">
                  {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
                </Button>
                <Button as="button" type="button" disabled={loading} onClick={() => processOrder('transfer')} className="w-full bg-coral text-white">
                  {loading ? 'Procesando...' : 'Pagar por transferencia'}
                </Button>
              </div>

              {result ? (
                <div className="mt-6 rounded-[28px] bg-mint/18 p-5 text-sm text-lagoon">
                  <p className="font-semibold">Preferencia creada: {result.preference_id}</p>
                  <a className="mt-2 inline-flex font-semibold underline" href={result.checkout_url} target="_blank" rel="noreferrer">
                    Abrir checkout de Mercado Pago
                  </a>
                </div>
              ) : null}
            </Card>

            <div className="grid gap-6">
              <Card className="bg-ink p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Resumen</p>
                <h2 className="mt-3 font-display text-4xl">{itemsCount} items listos</h2>
                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  {cart.map((item) => (
                    <li key={item.productId} className="flex items-center justify-between gap-4">
                      <span>{item.title} x {item.qty}</span>
                      <span>{formatCurrency(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-white/15 pt-5">
                  <div className="flex items-center justify-between font-display text-3xl">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <p className="mt-5 text-sm text-white/65">Si elegis envio, el backend valida Villa Maipu antes de crear la orden.</p>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Ayuda</p>
                <h2 className="mt-3 font-display text-4xl text-ink">Preferis revisar primero</h2>
                <p className="mt-4 text-sm leading-7 text-ink/65">Podes volver al carrito, ajustar cantidades o ir por el flujo de impresiones si el cliente no compra productos.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button as={Link} to="/cart" className="bg-ink text-white">Volver al carrito</Button>
                  <Button as={Link} to="/prints" className="border border-stone-200 bg-white text-ink">Ir a impresiones</Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default CheckoutPage;
