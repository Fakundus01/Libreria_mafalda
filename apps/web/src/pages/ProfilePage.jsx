import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiGet } from '../lib/api';

function ProfilePage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/my/orders', true)
      .then((res) => setOrders(res.data || []))
      .catch(() => setError('No se pudo cargar. Intentá nuevamente.'));
  }, []);

  return (
    <main className="bg-cream py-12">
      <Container>
        <h1 className="font-serif text-3xl">Mi perfil</h1>
        {error && <p className="mt-3 text-red-600">{error}</p>}
        {orders.length === 0 ? (
          <Card className="mt-4"><p className="text-sm text-stone-600">No tenés pedidos aún.</p></Card>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <Card key={order.order_code}>
                <p className="font-semibold">{order.order_code}</p>
                <p className="text-sm">Estado: {order.status}</p>
                <p className="text-sm">Total: ${order.total_amount}</p>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

export default ProfilePage;
