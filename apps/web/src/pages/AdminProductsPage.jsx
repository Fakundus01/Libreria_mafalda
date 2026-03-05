import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageLoader from '../components/PageLoader';
import StatusPill from '../components/StatusPill';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
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

function AdminProductsPage() {
  const { adminToken, adminUser, checkingAccess, accessError } = useAdminAccess();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageInputs, setImageInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState(null);
  const [error, setError] = useState('');

  const lowStockCount = useMemo(() => products.filter((item) => Number(item.stock) <= 5).length, [products]);

  const loadProducts = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (activeFilter !== 'all') params.set('active', activeFilter);
      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await apiGet(`/api/admin/products${suffix}`, { token: adminToken });
      setProducts(response.data || []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken || checkingAccess) return;
    loadProducts();
  }, [adminToken, checkingAccess, query, activeFilter]);

  const resetProductEditor = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

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
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (productId) => {
    try {
      await apiDelete(`/api/admin/products/${productId}`, { token: adminToken });
      if (editingProductId === productId) resetProductEditor();
      await loadProducts();
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
      await loadProducts();
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
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron subir las imagenes.');
    } finally {
      setUploadingProductId(null);
    }
  };

  const removeImage = async (imageId) => {
    try {
      await apiDelete(`/api/admin/product-images/${imageId}`, { token: adminToken });
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar la imagen.');
    }
  };

  if (checkingAccess) {
    return (
      <AdminLayout title="Validando acceso" description="Estamos comprobando la sesion admin." showNav={false}>
        <PageLoader title="Abriendo productos" message="Validando permisos antes de mostrar el catalogo admin." />
      </AdminLayout>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout title="Productos" description="Alta, edicion, baja, stock, precios e imagenes del catalogo online.">
      {accessError ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{accessError}</p> : null}
      {error ? <p className="mb-5 rounded-[24px] bg-berry/10 p-5 text-sm text-berry">{error}</p> : null}

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Catalogo</p>
          <p className="mt-3 font-display text-5xl text-ink">{products.length}</p>
          <p className="mt-2 text-sm text-ink/65">Productos listados con los filtros actuales.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Activos</p>
          <p className="mt-3 font-display text-5xl text-ink">{products.filter((item) => item.is_active).length}</p>
          <p className="mt-2 text-sm text-ink/65">Disponibles para mostrarse en la tienda.</p>
        </Card>
        <Card className="bg-[#fff2e6]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Stock bajo</p>
          <p className="mt-3 font-display text-5xl text-ink">{lowStockCount}</p>
          <p className="mt-2 text-sm text-ink/65">Productos que conviene reponer pronto.</p>
        </Card>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-7" id="product-manager">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Editor</p>
              <h2 className="mt-2 font-display text-4xl text-ink">Crear o editar producto</h2>
            </div>
            {editingProductId ? (
              <Button as="button" type="button" onClick={resetProductEditor} className="border border-stone-200 bg-white text-ink">
                Cancelar
              </Button>
            ) : null}
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveProduct}>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink/80">Nombre del producto</label>
              <input className="input-field" value={productForm.title} onChange={(event) => setProductForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/80">Categoria</label>
              <input className="input-field" value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/80">SKU</label>
              <input className="input-field" value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/80">Precio</label>
              <input className="input-field" type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/80">Stock</label>
              <input className="input-field" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink/80">Descripcion</label>
              <textarea className="textarea-field" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink/80">Tags</label>
              <input className="input-field" value={productForm.tags} onChange={(event) => setProductForm((current) => ({ ...current, tags: event.target.value }))} placeholder="escolar, oferta, novedad" />
            </div>
            <label className="flex items-center gap-3 rounded-[20px] bg-[#fff4df] px-4 py-3 text-sm font-semibold text-ink">
              <input type="checkbox" checked={productForm.is_active} onChange={(event) => setProductForm((current) => ({ ...current, is_active: event.target.checked }))} />
              Producto activo
            </label>
            <label className="flex items-center gap-3 rounded-[20px] bg-[#fff4df] px-4 py-3 text-sm font-semibold text-ink">
              <input type="checkbox" checked={productForm.is_offer} onChange={(event) => setProductForm((current) => ({ ...current, is_offer: event.target.checked }))} />
              Mostrar oferta
            </label>
            {productForm.is_offer ? (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-ink/80">Precio oferta</label>
                <input className="input-field" type="number" min="0" step="0.01" value={productForm.offer_price} onChange={(event) => setProductForm((current) => ({ ...current, offer_price: event.target.value }))} />
              </div>
            ) : null}
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button as="button" type="submit" disabled={saving} className="bg-ink text-white">
                {saving ? 'Guardando...' : editingProductId ? 'Actualizar producto' : 'Crear producto'}
              </Button>
              <Button as="button" type="button" onClick={resetProductEditor} className="border border-stone-200 bg-white text-ink">
                Limpiar formulario
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Busqueda</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Filtrar catalogo</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <input className="input-field" placeholder="Buscar por nombre, categoria, tags o SKU" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="input-field" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo ocultos</option>
            </select>
          </div>
          <Button as="button" type="button" onClick={loadProducts} className="mt-4 bg-coral text-white">
            Actualizar listado
          </Button>
        </Card>
      </section>

      {loading ? <PageLoader title="Cargando productos" message="Estamos leyendo el catalogo admin." /> : null}

      <section className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">{product.category || 'Sin categoria'}</p>
                <h3 className="mt-2 font-display text-3xl text-ink">{product.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{formatCurrency(product.effective_price)} · stock {product.stock}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill status={product.is_active ? 'APPROVED' : 'FAILED'} />
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

        {!loading && products.length === 0 ? (
          <Card>
            <p className="text-sm text-ink/65">No hay productos que coincidan con la busqueda actual.</p>
          </Card>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default AdminProductsPage;
