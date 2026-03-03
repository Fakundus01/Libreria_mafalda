import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { apiGet } from '../lib/api';

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/products')
      .then((data) => setProducts(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const cartCount = useMemo(() => {
    const raw = localStorage.getItem('mafalda_cart');
    if (!raw) return 0;
    return JSON.parse(raw).reduce((acc, item) => acc + item.qty, 0);
  }, [products]);

  const addToCart = (product) => {
    const raw = localStorage.getItem('mafalda_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const found = cart.find((item) => item.productId === product.id);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({
        productId: product.id,
        title: product.title,
        price: product.effective_price,
        qty: 1,
        image: product.images?.[0]?.url,
      });
    }
    localStorage.setItem('mafalda_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="bg-cream text-stone-800">
      <Header site={siteConfig} />
      <main className="py-12">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-serif text-3xl text-stone-900">Tienda online</h1>
            <Button as={Link} to="/checkout" className="bg-stone-900 text-cream">
              Ver carrito ({cartCount})
            </Button>
          </div>

          {loading && <p>Cargando productos...</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <img src={product.images?.[0]?.url || 'https://placehold.co/600x380'} alt={product.title} className="h-44 w-full rounded-xl object-cover" />
                <h3 className="mt-3 font-serif text-xl">{product.title}</h3>
                <p className="text-sm text-stone-600">{product.description}</p>
                <p className="mt-2 font-semibold text-terracotta">${product.effective_price}</p>
                <Button as="button" onClick={() => addToCart(product)} className="mt-4 w-full bg-terracotta text-white">
                  Agregar al carrito
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default ShopPage;
