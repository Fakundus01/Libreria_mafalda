import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';
import { siteConfig } from '../config/site';

function CatalogPage() {
  return (
    <main className="flex min-h-screen items-center bg-cream py-16">
      <Container className="text-center">
        <h1 className="font-serif text-4xl text-stone-900">Catálogo en construcción</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Estamos preparando el catálogo online de {siteConfig.name} para que puedas explorar productos y precios actualizados.
        </p>
        <Button as={Link} to="/" className="mt-8 bg-stone-900 text-cream">
          Volver al inicio
        </Button>
      </Container>
    </main>
  );
}

export default CatalogPage;
