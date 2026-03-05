import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageLoader from '../components/PageLoader';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { apiGet } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/format';

function MetricCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'accent' ? 'bg-ink text-white' : tone === 'warm' ? 'bg-[#fff2e6]' : 'bg-white/92';
  const textClass = tone === 'accent' ? 'text-sun' : 'text-coral/80';

  return (
    <Card className={toneClass}>
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${textClass}`}>{label}</p>
      <p className="mt-3 font-display text-5xl">{value}</p>
    </Card>
  );
}

function AdminDashboardPage() {
  const { adminToken, adminUser, checkingAccess, accessError } = useAdminAccess();
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError('');

    try {
      const [metricsResponse, auditResponse] = await Promise.all([
        apiGet('/api/admin/metrics', { token: adminToken }),
        apiGet('/api/admin/audit-logs?limit=8', { token: adminToken }),
      ]);
      setMetrics(metricsResponse.data || null);
      setAuditLogs(auditResponse.data || []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar el dashboard admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken || checkingAccess) return;
    loadDashboard();
  }, [adminToken, checkingAccess]);

  if (checkingAccess) {
    return (
      <AdminLayout title="Validando acceso" description="Estamos comprobando la sesion admin." showNav={false}>
        <PageLoader title="Validando acceso admin" message="Un momento, estamos revisando tus permisos." />
      </AdminLayout>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout
      title="Dashboard del ecommerce"
      description="Vista general de ventas, catalogo, clientes y actividad reciente del negocio."
      actions={
        <Button as={Link} to="/admin/products" className="bg-coral text-white">
          Gestionar productos
        </Button>
      }
    >
      {loading ? <PageLoader title="Actualizando panel" message="Estamos trayendo metricas y actividad reciente." /> : null}
      {accessError ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{accessError}</p> : null}
      {error ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{error}</p> : null}

      {metrics ? (
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Ganancias" value={formatCurrency(metrics.total_sales)} tone="accent" />
          <MetricCard label="Productos" value={metrics.products_count} />
          <MetricCard label="Clientes" value={metrics.customers_count} />
          <MetricCard label="Mensajes" value={metrics.contact_messages_count} />
          <MetricCard label="Impresiones" value={metrics.print_requests_count} tone="warm" />
          <MetricCard label="Pedidos" value={metrics.orders_count} />
          <MetricCard label="Pendientes" value={metrics.pending_orders_count} />
          <MetricCard label="Ticket prom." value={formatCurrency(metrics.avg_ticket)} />
          <MetricCard label="Activos" value={metrics.active_products_count} />
          <MetricCard label="Impresiones pendientes" value={metrics.pending_print_requests} />
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-[#fff2e6]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Top productos</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Lo mas vendido</h2>
            </div>
            <Button as={Link} to="/admin/products" className="border border-stone-200 bg-white text-ink">
              Ver catalogo
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {metrics?.top_products?.length ? metrics.top_products.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-[20px] bg-white/75 px-4 py-3">
                <span className="text-sm font-semibold text-ink">{item.title}</span>
                <span className="text-sm text-ink/65">{item.units} un.</span>
              </div>
            )) : <p className="text-sm text-ink/65">Todavia no hay ventas suficientes para este ranking.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Stock bajo</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Alertas rapidas</h2>
            </div>
            <Button as={Link} to="/admin/products" className="border border-stone-200 bg-white text-ink">
              Reponer
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {metrics?.low_stock_products?.length ? metrics.low_stock_products.map((item) => (
              <div key={item.id} className="rounded-[20px] bg-[#fff7ef] px-4 py-3">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-coral">Quedan {item.stock} unidades</p>
              </div>
            )) : <p className="text-sm text-ink/65">No hay alertas de stock por ahora.</p>}
          </div>
        </Card>

        <Card className="bg-ink text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Mensajes recientes</p>
              <h2 className="mt-2 font-display text-3xl text-white">Contacto</h2>
            </div>
            <Button as={Link} to="/admin/messages" className="bg-white text-ink">
              Abrir
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {metrics?.recent_contacts?.length ? metrics.recent_contacts.map((item) => (
              <div key={item.id} className="rounded-[20px] bg-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs text-white/70">{item.email}</p>
              </div>
            )) : <p className="text-sm text-white/70">No hay mensajes cargados.</p>}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Actividad</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Ultimos movimientos</h2>
            </div>
            <Button as={Link} to="/admin/orders" className="border border-stone-200 bg-white text-ink">
              Ver pedidos
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {auditLogs.length ? auditLogs.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-stone-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{item.action}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-coral/80">{item.entity_type}</span>
                </div>
                <p className="mt-2 text-sm text-ink/65">Entidad: {item.entity_id}</p>
                <p className="mt-1 text-xs text-ink/50">{formatDateTime(item.created_at)}</p>
              </div>
            )) : <p className="text-sm text-ink/65">No hay actividad reciente para mostrar.</p>}
          </div>
        </Card>

        <Card className="bg-[#f4fbf7]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Acciones rapidas</p>
          <div className="mt-5 grid gap-3">
            <Button as={Link} to="/admin/products" className="bg-ink text-white">
              Crear o editar productos
            </Button>
            <Button as={Link} to="/admin/orders" className="bg-coral text-white">
              Revisar pedidos e impresiones
            </Button>
            <Button as={Link} to="/admin/customers" className="border border-stone-200 bg-white text-ink">
              Ver clientes
            </Button>
            <Button as={Link} to="/admin/messages" className="border border-stone-200 bg-white text-ink">
              Responder mensajes
            </Button>
          </div>
        </Card>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
