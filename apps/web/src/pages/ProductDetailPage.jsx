import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiGet } from '../lib/api';
import { formatCurrency } from '../lib/format';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useShop();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    let active = true;

    apiGet(`/api/products/${id}`)
      .then((res) => {
        if (!active) return;
        setProduct(res.data);
        setSelectedImage(res.data.images?.[0]?.url || '');
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError.message || 'No se pudo cargar el producto.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="px-3 py-8">
        <Header site={siteConfig} />
        <main className="py-10">
          <Container>
            <Card className="text-center">
              <h1 className="font-display text-4xl text-ink">No pudimos abrir el producto</h1>
              <p className="mt-3 text-sm text-ink/65">{error}</p>
              <Button as={Link} to="/shop" className="mt-6 bg-ink text-white">Volver a la tienda</Button>
            </Card>
          </Container>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-3 py-8">
        <Header site={siteConfig} />
        <main className="py-10">
          <Container className="max-w-3xl">
            <PageLoader title="Cargando producto" message="Estamos buscando las fotos y el stock disponible." />
          </Container>
        </main>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: 'https://placehold.co/900x700/FFE7CC/1F2937?text=Mafalda' }];

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden p-4">
              <div className="overflow-hidden rounded-[28px] bg-[#fff1de]">
                <img src={selectedImage || images[0].url} alt={product.title} className="h-[460px] w-full object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((image) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setSelectedImage(image.url)}
                    className={`overflow-hidden rounded-[20px] border ${selectedImage === image.url ? 'border-coral' : 'border-transparent'} bg-[#fff4df]`}
                  >
                    <img src={image.url} alt={product.title} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-white/92 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">{product.category || 'Libreria'}</p>
              <h1 className="mt-3 font-display text-5xl leading-none text-ink">{product.title}</h1>
              <p className="mt-5 text-base leading-8 text-ink/68">{product.description || 'Producto destacado listo para la tienda online.'}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {product.is_offer ? <span className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">Oferta activa</span> : null}
                <span className="rounded-full bg-sun/35 px-4 py-2 text-sm font-semibold text-ink">Stock {product.stock}</span>
                <span className="rounded-full bg-mint/25 px-4 py-2 text-sm font-semibold text-lagoon">Retiro o envio local</span>
              </div>

              <div className="mt-8 rounded-[28px] bg-[#fff7ef] p-6">
                <p className="text-sm text-ink/55">Precio final</p>
                <p className="mt-1 font-display text-6xl leading-none text-ink">{formatCurrency(product.effective_price)}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center rounded-full border border-stone-200 bg-white px-3 py-2">
                  <button type="button" className="h-10 w-10 rounded-full bg-[#fff4df] text-lg" onClick={() => setQty((current) => Math.max(1, current - 1))}>-</button>
                  <span className="min-w-12 px-4 text-center font-semibold">{qty}</span>
                  <button type="button" className="h-10 w-10 rounded-full bg-[#fff4df] text-lg" onClick={() => setQty((current) => Math.min(product.stock || 99, current + 1))}>+</button>
                </div>
                <Button as="button" type="button" onClick={() => addToCart(product, qty)} className="flex-1 bg-ink text-white">
                  Agregar {qty} al carrito
                </Button>
              </div>

              <div className="mt-8 grid gap-3 rounded-[28px] bg-ink p-5 text-white sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sun">Pago</p>
                  <p className="mt-2 text-sm text-white/75">Mercado Pago o transferencia.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sun">Entrega</p>
                  <p className="mt-2 text-sm text-white/75">Villa Maipu o retiro en el local.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sun">Ayuda</p>
                  <p className="mt-2 text-sm text-white/75">Seguimiento por mail y WhatsApp.</p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default ProductDetailPage;
