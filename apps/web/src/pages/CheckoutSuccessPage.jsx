import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function CheckoutSuccessPage() {
  return (
    <main className="px-3 py-16 text-center text-ink">
      <Container className="max-w-3xl rounded-[36px] border border-white/70 bg-white/85 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Pago confirmado</p>
        <h1 className="mt-3 font-display text-6xl leading-none">Compra exitosa</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/68">El cliente ya quedo dentro del circuito y el pedido puede seguirse desde mail, perfil o admin.</p>
        <Button as={Link} to="/" className="mt-8 bg-ink text-white">Volver al inicio</Button>
      </Container>
    </main>
  );
}

export default CheckoutSuccessPage;
