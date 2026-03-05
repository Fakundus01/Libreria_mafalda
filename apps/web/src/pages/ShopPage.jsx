import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiGet } from '../lib/api';
import { formatCurrency } from '../lib/format';

function ShopSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="skeleton h-64 rounded-[24px] animate-shimmer" />
          <div className="skeleton mt-4 h-5 w-1/3 rounded-full animate-shimmer" />
          <div className="skeleton mt-3 h-10 w-4/5 rounded-full animate-shimmer" />
          <div className="skeleton mt-3 h-20 rounded-[20px] animate-shimmer" />
          <div className="skeleton mt-5 h-12 rounded-full animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

function ShopPage() {
  const { addToCart, cartCount, cartTotal } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let active = true;

    apiGet('/api/products')
      .then((data) => {
        if (!active) return;
        setProducts(data.data || []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError.message || 'No se pudieron cargar los productos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ['Todos', ...new Set(products.map((product) => product.category || 'Libreria'))], [products]);
  const filteredProducts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery = !normalized
        || product.title.toLowerCase().includes(normalized)
        || String(product.description || '').toLowerCase().includes(normalized)
        || String(product.tags || '').toLowerCase().includes(normalized);
      const matchesCategory = category === 'Todos' || (product.category || 'Libreria') === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, deferredQuery, products]);

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <section className="rounded-[38px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:px-10 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Tienda online</p>
                <h1 className="mt-3 font-display text-5xl leading-none text-ink sm:text-6xl">Catalogo listo para vender</h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-ink/68">Buscador, filtros, stock visible, tarjetas mas fuertes y carrito siempre a mano.</p>
              </div>

              <div className="rounded-[30px] bg-ink p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Resumen rapido</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-sm text-white/65">Items en carrito</p>
                    <p className="mt-1 font-display text-4xl">{cartCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/65">Total estimado</p>
                    <p className="mt-1 font-display text-4xl">{formatCurrency(cartTotal)}</p>
                  </div>
                </div>
                <Button as={Link} to="/cart" className="mt-6 w-full bg-white text-ink">
                  Abrir carrito
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[30px] bg-[#fff4df] p-4 lg:grid-cols-[1fr_240px]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-field"
                placeholder="Buscar cuadernos, agendas, marcadores..."
              />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="select-field">
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="mt-8">
            {loading ? <ShopSkeleton /> : null}
            {!loading && error ? <p className="rounded-[24px] bg-white/85 p-6 text-sm text-berry">{error}</p> : null}
            {!loading && !error ? (
              <>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">{filteredProducts.length} productos visibles</p>
                  <p className="text-sm text-ink/65">Entrega local en Villa Maipu o retiro por el local.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={addToCart} />
                  ))}
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-coral/30 bg-white/80 px-6 py-10 text-center text-ink/65">
                    No encontramos coincidencias para tu filtro actual.
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default ShopPage;
