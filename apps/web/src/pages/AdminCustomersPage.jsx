import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Card from '../components/Card';
import PageLoader from '../components/PageLoader';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { apiGet } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/format';

function AdminCustomersPage() {
  const { adminToken, adminUser, checkingAccess, accessError } = useAdminAccess();
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((item) => [item.full_name, item.email, item.phone].join(' ').toLowerCase().includes(term));
  }, [customers, query]);

  const loadCustomers = async () => {
    if (!adminToken) return;
    setLoading(true);
    setError('');

    try {
      const response = await apiGet('/api/admin/customers', { token: adminToken });
      setCustomers(response.data || []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken || checkingAccess) return;
    loadCustomers();
  }, [adminToken, checkingAccess]);

  if (checkingAccess) {
    return (
      <AdminLayout title="Validando acceso" description="Estamos comprobando la sesion admin." showNav={false}>
        <PageLoader title="Abriendo clientes" message="Validando permisos antes de mostrar la base de clientes." />
      </AdminLayout>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout title="Clientes" description="Registro de usuarios compradores con resumen de actividad y gasto acumulado.">
      {accessError ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{accessError}</p> : null}
      {error ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{error}</p> : null}

      <Card className="mb-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Busqueda</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input className="input-field" placeholder="Buscar por nombre, email o telefono" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="rounded-full bg-[#fff2e6] px-5 py-3 text-sm font-semibold text-ink">
            {filteredCustomers.length} clientes
          </div>
        </div>
      </Card>

      {loading ? <PageLoader title="Cargando clientes" message="Estamos leyendo el padrón de clientes y sus compras." /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Cliente</p>
                <h2 className="mt-2 font-display text-3xl text-ink">{customer.full_name}</h2>
              </div>
              <span className="rounded-full bg-[#fff2e6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coral">{customer.role}</span>
            </div>
            <div className="mt-5 grid gap-2 text-sm text-ink/70">
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Telefono:</strong> {customer.phone || 'Sin telefono'}</p>
              <p><strong>Alta:</strong> {formatDateTime(customer.created_at)}</p>
              <p><strong>Pedidos:</strong> {customer.orders_count}</p>
              <p><strong>Facturado:</strong> {formatCurrency(customer.total_spent)}</p>
              <p><strong>Ultima compra:</strong> {customer.last_order_at ? formatDateTime(customer.last_order_at) : 'Sin compras'}</p>
            </div>
          </Card>
        ))}

        {!loading && filteredCustomers.length === 0 ? (
          <Card>
            <p className="text-sm text-ink/65">No se encontraron clientes con ese criterio.</p>
          </Card>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default AdminCustomersPage;
