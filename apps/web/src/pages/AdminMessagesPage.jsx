import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminPagination from '../components/admin/AdminPagination';
import Card from '../components/Card';
import PageLoader from '../components/PageLoader';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { apiGet } from '../lib/api';
import { formatDateTime } from '../lib/format';

const PAGE_SIZE = 8;

function AdminMessagesPage() {
  const { adminUser, checkingAccess, accessError } = useAdminAccess();
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (query.trim()) params.set('q', query.trim());
      const response = await apiGet(`/api/admin/messages?${params.toString()}`);
      setMessages(response.data || []);
      setMeta(response.meta || null);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar los mensajes.');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    if (checkingAccess) return;
    loadMessages();
  }, [checkingAccess, loadMessages]);

  if (checkingAccess) {
    return (
      <AdminLayout title="Validando acceso" description="Estamos comprobando la sesion admin." showNav={false}>
        <PageLoader title="Abriendo mensajes" message="Validando permisos antes de mostrar las consultas." />
      </AdminLayout>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout title="Mensajes y solicitudes" description="Consultas recibidas desde el sitio para seguimiento comercial o atencion al cliente.">
      {accessError ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{accessError}</p> : null}
      {error ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{error}</p> : null}

      <Card className="mb-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Busqueda</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            className="input-field"
            placeholder="Buscar por nombre, mail o contenido"
            value={query}
            onChange={(event) => {
              setPage(0);
              setQuery(event.target.value);
            }}
          />
          <div className="rounded-full bg-[#fff2e6] px-5 py-3 text-sm font-semibold text-ink">
            {meta?.total ?? messages.length} mensajes
          </div>
        </div>
      </Card>

      {loading ? <PageLoader title="Cargando mensajes" message="Estamos leyendo las consultas del formulario de contacto." /> : null}

      <section className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Mensaje</p>
                <h2 className="mt-2 font-display text-3xl text-ink">{message.name}</h2>
                <p className="mt-2 text-sm text-ink/65">{message.email}</p>
              </div>
              <span className="rounded-full bg-[#fff2e6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coral">
                {formatDateTime(message.created_at)}
              </span>
            </div>
            <p className="mt-5 rounded-[22px] bg-[#fffaf4] px-5 py-4 text-sm leading-7 text-ink/75">{message.message}</p>
          </Card>
        ))}

        {!loading && messages.length === 0 ? (
          <Card>
            <p className="text-sm text-ink/65">No se encontraron mensajes para ese filtro.</p>
          </Card>
        ) : null}
      </section>

      <AdminPagination
        meta={meta}
        loading={loading}
        onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
        onNext={() => setPage((current) => current + 1)}
      />
    </AdminLayout>
  );
}

export default AdminMessagesPage;
