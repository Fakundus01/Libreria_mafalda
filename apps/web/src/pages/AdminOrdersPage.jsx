import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageLoader from '../components/PageLoader';
import StatusPill from '../components/StatusPill';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { apiGet, apiPatch } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/format';

function AdminOrdersPage() {
  const { adminToken, adminUser, checkingAccess, accessError } = useAdminAccess();
  const [orders, setOrders] = useState([]);
  const [prints, setPrints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pendingOrders = useMemo(() => orders.filter((item) => ['PENDING_PAYMENT', 'PAID', 'PREPARING'].includes(item.status)).length, [orders]);
  const pendingPrints = useMemo(() => prints.filter((item) => ['RECEIVED', 'IN_PROGRESS'].includes(item.status)).length, [prints]);

  const loadData = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError('');
    try {
      const [ordersResponse, printsResponse] = await Promise.all([
        apiGet('/api/admin/orders', { token: adminToken }),
        apiGet('/api/admin/prints', { token: adminToken }),
      ]);
      setOrders(ordersResponse.data || []);
      setPrints(printsResponse.data || []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar pedidos e impresiones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken || checkingAccess) return;
    loadData();
  }, [adminToken, checkingAccess]);

  const updateOrder = async (orderCode, status) => {
    try {
      await apiPatch(`/api/admin/orders/${orderCode}`, { status }, { token: adminToken });
      await loadData();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar el pedido.');
    }
  };

  const updateTransfer = async (orderCode, status) => {
    try {
      await apiPatch(`/api/admin/payments/transfer/${orderCode}`, { status }, { token: adminToken });
      await loadData();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la transferencia.');
    }
  };

  const updatePrint = async (printCode, status) => {
    try {
      await apiPatch(`/api/admin/prints/${printCode}`, { status }, { token: adminToken });
      await loadData();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la impresion.');
    }
  };

  if (checkingAccess) {
    return (
      <AdminLayout title="Validando acceso" description="Estamos comprobando la sesion admin." showNav={false}>
        <PageLoader title="Abriendo pedidos" message="Validando permisos antes de mostrar la operacion." />
      </AdminLayout>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout title="Pedidos e impresiones" description="Seguimiento de ventas, transferencias e impresiones desde un solo tablero.">
      {accessError ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{accessError}</p> : null}
      {error ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{error}</p> : null}

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pedidos</p>
          <p className="mt-3 font-display text-5xl text-ink">{orders.length}</p>
        </Card>
        <Card className="bg-[#fff2e6]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pendientes</p>
          <p className="mt-3 font-display text-5xl text-ink">{pendingOrders}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Impresiones activas</p>
          <p className="mt-3 font-display text-5xl text-ink">{pendingPrints}</p>
        </Card>
      </section>

      {loading ? <PageLoader title="Cargando operacion" message="Estamos leyendo pedidos y solicitudes de impresion." /> : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-4xl text-ink">Pedidos</h2>
          <div className="mt-4 grid gap-4">
            {orders.map((order) => (
              <Card key={order.order_code} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl text-ink">{order.order_code}</h3>
                    <p className="mt-2 text-sm text-ink/65">{order.customer_name} · {order.customer_email}</p>
                    <p className="mt-1 text-sm text-ink/65">{formatDateTime(order.created_at)}</p>
                    <p className="mt-1 text-sm text-ink/65">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                <div className="mt-4 space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[18px] bg-[#fff7ef] px-4 py-3 text-sm text-ink/70">
                      <span>{item.title_snapshot}</span>
                      <span>{item.quantity} x {formatCurrency(item.unit_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button as="button" type="button" onClick={() => updateOrder(order.order_code, 'PREPARING')} className="bg-ink text-white">Preparar</Button>
                  <Button as="button" type="button" onClick={() => updateOrder(order.order_code, 'COMPLETED')} className="bg-coral text-white">Completar</Button>
                  <Button as="button" type="button" onClick={() => updateTransfer(order.order_code, 'APPROVED')} className="bg-mint text-ink">Aprobar transferencia</Button>
                </div>
              </Card>
            ))}

            {!loading && orders.length === 0 ? (
              <Card>
                <p className="text-sm text-ink/65">Todavia no hay pedidos cargados.</p>
              </Card>
            ) : null}
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
                    <p className="mt-1 text-sm text-ink/65">{formatDateTime(item.created_at)}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button as="button" type="button" onClick={() => updatePrint(item.print_code, 'IN_PROGRESS')} className="bg-ink text-white">En proceso</Button>
                  <Button as="button" type="button" onClick={() => updatePrint(item.print_code, 'READY')} className="bg-coral text-white">Marcar lista</Button>
                  <Button as="button" type="button" onClick={() => updatePrint(item.print_code, 'DELIVERED')} className="border border-stone-200 bg-white text-ink">Entregada</Button>
                </div>
              </Card>
            ))}

            {!loading && prints.length === 0 ? (
              <Card>
                <p className="text-sm text-ink/65">No hay impresiones activas ahora mismo.</p>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminOrdersPage;
