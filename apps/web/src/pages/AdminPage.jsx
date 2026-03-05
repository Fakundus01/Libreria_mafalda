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
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../lib/api';
import { formatCurrency } from '../lib/format';

const emptyProductForm = {
  title: '',
  category: '',
  sku: '',
  price: '',
  stock: '',
  description: '',
  tags: '',
  is_active: true,
  is_offer: false,
  offer_price: '',
};

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

function AdminPage() {
  const { adminToken, adminUser, applyAdminSession, logoutAdmin } = useShop();
  const [form, setForm] = useState({ email: '', password: '' });
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [prints, setPrints] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageInputs, setImageInputs] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(Boolean(adminToken));
  const [productSaving, setProductSaving] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState(null);

  const loadDashboard = async (token = adminToken) => {
    setLoading(true);
    setError('');
    try {
      const [meRes, ordersRes, printsRes, metricsRes, productsRes] = await Promise.all([
        apiGet('/api/admin/me', { token }),
        apiGet('/api/admin/orders', { token }),
        apiGet('/api/admin/prints', { token }),
        apiGet('/api/admin/metrics', { token }),
        apiGet('/api/admin/products', { token }),
      ]);
      applyAdminSession({ nextAdminToken: token, nextAdminUser: meRes.user });
      setOrders(ordersRes.data || []);
      setPrints(printsRes.data || []);
      setMetrics(metricsRes.data || null);
      setProducts(productsRes.data || []);
    } catch (requestError) {
      logoutAdmin();
      setError(requestError.message || 'No se pudo cargar el panel admin.');
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadDashboard(adminToken);
    } else {
      setCheckingAccess(false);
    }
  }, [adminToken]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost('/api/admin/auth/login', form);
      await loadDashboard(res.token);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesion admin.');
      setLoading(false);
      setCheckingAccess(false);
    }
  };

  const resetProductEditor = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setError('');
    setProductSaving(true);

    const payload = {
      ...productForm,
      price: Number(productForm.price || 0),
      stock: Number(productForm.stock || 0),
      offer_price: productForm.is_offer && productForm.offer_price !== '' ? Number(productForm.offer_price) : null,
    };

    try {
      if (editingProductId) {
        await apiPut(`/api/admin/products/${editingProductId}`, payload, { token: adminToken });
      } else {
        await apiPost('/api/admin/products', payload, { token: adminToken });
      }
      resetProductEditor();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar el producto.');
    } finally {
      setProductSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title || '',
      category: product.category || '',
      sku: product.sku || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      description: product.description || '',
      tags: product.tags || '',
      is_active: Boolean(product.is_active),
      is_offer: Boolean(product.is_offer),
      offer_price: product.offer_price != null ? String(product.offer_price) : '',
    });
  };

  const removeProduct = async (productId) => {
    try {
      await apiDelete(`/api/admin/products/${productId}`, { token: adminToken });
      if (editingProductId === productId) resetProductEditor();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar el producto.');
    }
  };

  const addImageUrl = async (productId) => {
    const url = (imageInputs[productId] || '').trim();
    if (!url) return;

    try {
      await apiPost(`/api/admin/products/${productId}/images`, { url }, { token: adminToken });
      setImageInputs((current) => ({ ...current, [productId]: '' }));
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo agregar la imagen.');
    }
  };

  const uploadImages = async (productId, files) => {
    if (!files?.length) return;
    setUploadingProductId(productId);
    setError('');
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      await apiPost(`/api/admin/products/${productId}/images/upload`, formData, { token: adminToken });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron subir las imagenes.');
    } finally {
      setUploadingProductId(null);
    }
  };

  const removeImage = async (imageId) => {
    try {
      await apiDelete(`/api/admin/product-images/${imageId}`, { token: adminToken });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar la imagen.');
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

  if (checkingAccess) {
    return (
      <div className="overflow-hidden pb-6 text-ink">
        <Header site={siteConfig} />
        <main className="px-3 py-8 sm:py-10">
          <Container className="max-w-3xl">
            <PageLoader title="Validando acceso admin" message="Estamos comprobando permisos antes de abrir el panel." />
          </Container>
        </main>
        <Footer site={siteConfig} />
      </div>
    );
  }

  if (!adminToken || !adminUser) {
    return (
      <div className="overflow-hidden pb-6 text-ink">
        <Header site={siteConfig} />
        <main className="px-3 py-8 sm:py-10">
          <Container className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-ink p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Admin</p>
              <h1 className="mt-3 font-display text-5xl leading-none">Panel operativo completo</h1>
              <p className="mt-4 text-sm leading-7 text-white/75">El dashboard solo se abre con usuario admin valido. Desde aca se gestionan productos, pedidos, clientes y solicitudes.</p>
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
              <h1 className="mt-2 font-display text-5xl leading-none text-ink">Operacion completa del ecommerce</h1>
              <p className="mt-3 text-sm text-ink/65">Sesión activa como {adminUser.full_name}.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="button" type="button" onClick={() => loadDashboard()} className="bg-ink text-white">Recargar</Button>
              <Button as="button" type="button" onClick={logoutAdmin} className="border border-stone-200 bg-white text-ink">Cerrar sesion</Button>
            </div>
          </div>

          {loading ? <PageLoader title="Actualizando panel" message="Estamos leyendo pedidos, productos, clientes y solicitudes." /> : null}
          {error ? <p className="mb-5 rounded-[24px] bg-white/85 p-5 text-sm text-berry">{error}</p> : null}

          {metrics ? (
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Ganancias" value={formatCurrency(metrics.total_sales)} tone="accent" />
              <MetricCard label="Productos" value={metrics.products_count} />
              <MetricCard label="Clientes" value={metrics.customers_count} />
              <MetricCard label="Solicitudes" value={metrics.contact_messages_count} />
              <MetricCard label="Impresiones" value={metrics.print_requests_count} tone="warm" />
              <MetricCard label="Pedidos" value={metrics.orders_count} />
              <MetricCard label="Pendientes" value={metrics.pending_orders_count} />
              <MetricCard label="Ticket prom." value={formatCurrency(metrics.avg_ticket)} />
              <MetricCard label="Activos" value={metrics.active_products_count} />
              <MetricCard label="Impresiones pendientes" value={metrics.pending_print_requests} />
            </section>
          ) : null}

          {metrics ? (
            <section className="mb-8 grid gap-6 lg:grid-cols-3">
              <Card className="bg-[#fff2e6]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Top productos</p>
                <div className="mt-5 space-y-3">
                  {metrics.top_products?.length ? metrics.top_products.map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-[20px] bg-white/70 px-4 py-3">
                      <span className="text-sm font-semibold text-ink">{item.title}</span>
                      <span className="text-sm text-ink/65">{item.units} un.</span>
                    </div>
                  )) : <p className="text-sm text-ink/65">Todavia no hay ventas suficientes.</p>}
                </div>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Stock bajo</p>
                <div className="mt-5 space-y-3">
                  {metrics.low_stock_products?.length ? metrics.low_stock_products.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[20px] bg-[#fff7ef] px-4 py-3">
                      <span className="text-sm font-semibold text-ink">{item.title}</span>
                      <span className="text-sm text-coral">{item.stock} disponibles</span>
                    </div>
                  )) : <p className="text-sm text-ink/65">No hay alertas de stock.</p>}
                </div>
              </Card>

              <Card className="bg-ink text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Mensajes recientes</p>
                <div className="mt-5 space-y-3">
                  {metrics.recent_contacts?.length ? metrics.recent_contacts.map((item) => (
                    <div key={item.id} className="rounded-[20px] bg-white/10 px-4 py-3">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-white/70">{item.email}</p>
                    </div>
                  )) : <p className="text-sm text-white/70">No hay mensajes cargados.</p>}
                </div>
              </Card>
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Productos</p>
                  <h2 className="mt-2 font-display text-4xl text-ink">Crear o editar</h2>
                </div>
                {editingProductId ? (
                  <Button as="button" type="button" onClick={resetProductEditor} className="border border-stone-200 bg-white text-ink">
                    Cancelar edicion
                  </Button>
                ) : null}
              </div>

              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveProduct}>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Nombre del producto</label>
                  <input className="input-field" value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Categoria</label>
                  <input className="input-field" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">SKU</label>
                  <input className="input-field" value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Precio</label>
                  <input className="input-field" type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Stock</label>
                  <input className="input-field" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Descripcion</label>
                  <textarea className="textarea-field" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Tags</label>
                  <input className="input-field" value={productForm.tags} onChange={(event) => setProductForm({ ...productForm, tags: event.target.value })} placeholder="demo, escolar, oferta" />
                </div>
                <label className="flex items-center gap-3 rounded-[20px] bg-[#fff4df] px-4 py-3 text-sm font-semibold text-ink">
                  <input type="checkbox" checked={productForm.is_active} onChange={(event) => setProductForm({ ...productForm, is_active: event.target.checked })} />
                  Producto activo
                </label>
                <label className="flex items-center gap-3 rounded-[20px] bg-[#fff4df] px-4 py-3 text-sm font-semibold text-ink">
                  <input type="checkbox" checked={productForm.is_offer} onChange={(event) => setProductForm({ ...productForm, is_offer: event.target.checked })} />
                  Mostrar oferta
                </label>
                {productForm.is_offer ? (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-ink/80">Precio oferta</label>
                    <input className="input-field" type="number" min="0" step="0.01" value={productForm.offer_price} onChange={(event) => setProductForm({ ...productForm, offer_price: event.target.value })} />
                  </div>
                ) : null}
                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <Button as="button" type="submit" disabled={productSaving} className="bg-ink text-white">
                    {productSaving ? 'Guardando...' : editingProductId ? 'Actualizar producto' : 'Crear producto'}
                  </Button>
                  <Button as="button" type="button" onClick={resetProductEditor} className="border border-stone-200 bg-white text-ink">
                    Limpiar formulario
                  </Button>
                </div>
              </form>
            </Card>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">{product.category || 'Sin categoria'}</p>
                      <h3 className="mt-2 font-display text-3xl text-ink">{product.title}</h3>
                      <p className="mt-2 text-sm text-ink/65">{formatCurrency(product.effective_price)} · stock {product.stock}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill status={product.is_active ? 'APPROVED' : 'PENDING'} />
                      {product.is_offer ? <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">Oferta</span> : null}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-ink/65">{product.description || 'Sin descripcion cargada.'}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {product.images?.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-[22px] border border-stone-200 bg-[#fff4df]">
                        <img src={image.url} alt={product.title} className="h-28 w-full object-cover" />
                        <button type="button" onClick={() => removeImage(image.id)} className="w-full px-3 py-2 text-sm font-semibold text-coral">
                          Eliminar imagen
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      className="input-field"
                      placeholder="Pegar URL de imagen"
                      value={imageInputs[product.id] || ''}
                      onChange={(event) => setImageInputs((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                    <Button as="button" type="button" onClick={() => addImageUrl(product.id)} className="border border-stone-200 bg-white text-ink">
                      Agregar URL
                    </Button>
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center justify-between rounded-[22px] border border-dashed border-coral/30 bg-white px-4 py-3 text-sm font-semibold text-ink">
                    <span>{uploadingProductId === product.id ? 'Subiendo imagenes...' : 'Subir archivos desde la compu'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => uploadImages(product.id, event.target.files)} />
                  </label>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button as="button" type="button" onClick={() => editProduct(product)} className="bg-ink text-white">Editar</Button>
                    <Button as="button" type="button" onClick={() => removeProduct(product.id)} className="bg-coral text-white">Eliminar</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
          </section>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default AdminPage;
