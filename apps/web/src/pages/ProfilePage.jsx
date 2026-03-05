import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import EmptyState from '../components/EmptyState';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
import StatusPill from '../components/StatusPill';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiGet } from '../lib/api';
import { formatCurrency } from '../lib/format';

function ProfilePage() {
  const { user, logout } = useShop();
  const [profile, setProfile] = useState(user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      apiGet('/api/auth/me', { auth: true }),
      apiGet('/api/my/orders', { auth: true }),
    ])
      .then(([meRes, ordersRes]) => {
        if (!active) return;
        setProfile(meRes.user || user);
        setOrders(ordersRes.data || []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'No se pudo cargar tu perfil.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          {loading ? <PageLoader title="Cargando perfil" message="Estamos trayendo tus datos y pedidos." /> : null}
          {!loading ? (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="bg-ink p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Mi cuenta</p>
                <h1 className="mt-3 font-display text-5xl leading-none">{profile?.full_name || 'Cliente Mafalda'}</h1>
                <div className="mt-6 grid gap-4 text-sm text-white/75">
                  <p><strong>Email:</strong> {profile?.email}</p>
                  <p><strong>Telefono:</strong> {profile?.phone || 'Sin telefono cargado'}</p>
                  <p><strong>Rol:</strong> {profile?.role}</p>
                </div>
                <Button as="button" type="button" onClick={logout} className="mt-8 bg-white text-ink">
                  Cerrar sesion
                </Button>
              </Card>

              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pedidos</p>
                    <h2 className="mt-2 font-display text-4xl text-ink">Historial de compras</h2>
                  </div>
                  <Button as={Link} to="/shop" className="bg-ink text-white">Comprar mas</Button>
                </div>

                {error ? <p className="rounded-[24px] bg-white/85 p-5 text-sm text-berry">{error}</p> : null}

                {!error && orders.length === 0 ? (
                  <EmptyState
                    title="Todavia no hay pedidos"
                    message="La cuenta ya esta lista. Solo falta completar una compra para ver el historial en esta pantalla."
                    actionLabel="Ir a tienda"
                    actionProps={{ as: Link, to: '/shop', className: 'bg-ink text-white' }}
                  />
                ) : null}

                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.order_code} className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pedido</p>
                          <h3 className="mt-2 font-display text-3xl text-ink">{order.order_code}</h3>
                          <p className="mt-3 text-sm text-ink/65">{order.fulfillment_type === 'DELIVERY' ? 'Envio local' : 'Retiro en local'}</p>
                        </div>
                        <div className="text-right">
                          <StatusPill status={order.status} />
                          <p className="mt-3 font-display text-3xl text-ink">{formatCurrency(order.total_amount)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default ProfilePage;
