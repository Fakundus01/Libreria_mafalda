import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function CheckoutSuccessPage() {
  return (
    <main className="bg-cream py-20 text-center">
      <Container>
        <h1 className="font-serif text-4xl">¡Pago exitoso!</h1>
        <p className="mt-4">Gracias por tu compra. En breve te enviaremos el estado por email.</p>
        <Button as={Link} to="/" className="mt-6 bg-stone-900 text-cream">Volver al inicio</Button>
      </Container>
    </main>
  );
}

export default CheckoutSuccessPage;
