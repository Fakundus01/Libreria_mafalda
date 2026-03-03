import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function NotFoundPage() {
  return (
    <main className="bg-cream py-20 text-center">
      <Container>
        <h1 className="font-serif text-5xl">404</h1>
        <p className="mt-3">No encontramos lo que buscás.</p>
        <Button as={Link} to="/" className="mt-6 bg-stone-900 text-cream">Volver al inicio</Button>
      </Container>
    </main>
  );
}

export default NotFoundPage;
