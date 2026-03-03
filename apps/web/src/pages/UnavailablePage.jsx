import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function UnavailablePage() {
  return (
    <main className="flex min-h-screen items-center bg-cream py-16">
      <Container className="text-center">
        <h1 className="font-serif text-4xl text-stone-900">Próximamente</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Esta sección no está disponible en este plan. Si querés, te ayudamos por WhatsApp o en el local.
        </p>
        <Button as={Link} to="/" className="mt-8 bg-stone-900 text-cream">
          Volver al inicio
        </Button>
      </Container>
    </main>
  );
}

export default UnavailablePage;
