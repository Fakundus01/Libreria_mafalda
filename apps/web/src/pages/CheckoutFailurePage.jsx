import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function CheckoutFailurePage() {
  return (
    <main className="bg-cream py-20 text-center">
      <Container>
        <h1 className="font-serif text-4xl">No se pudo procesar el pago</h1>
        <p className="mt-4">Intentá nuevamente o elegí transferencia bancaria.</p>
        <Button as={Link} to="/checkout" className="mt-6 bg-stone-900 text-cream">Volver a checkout</Button>
      </Container>
    </main>
  );
}

export default CheckoutFailurePage;
