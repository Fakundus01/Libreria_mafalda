import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiGet } from '../lib/api';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('No se pudo cargar. Intentá nuevamente.'));
  }, [id]);

  if (error) return <main className="p-8 text-center text-red-600">{error}</main>;
  if (!product) return <main className="p-8 text-center">Cargando...</main>;

  return (
    <main className="bg-cream py-12">
      <Container>
        <Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <img src={product.images?.[0]?.url || 'https://placehold.co/900x600'} alt={product.title} className="h-72 w-full rounded-xl object-cover" />
            <div>
              <h1 className="font-serif text-3xl">{product.title}</h1>
              <p className="mt-3 text-stone-600">{product.description}</p>
              <p className="mt-4 text-xl font-semibold text-terracotta">${product.effective_price}</p>
              <Button as="button" className="mt-5 bg-stone-900 text-cream">Agregar al carrito</Button>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}

export default ProductDetailPage;
