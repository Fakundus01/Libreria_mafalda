import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';

function UnavailablePage() {
  return (
    <main className="flex min-h-screen items-center px-3 py-16 text-ink">
      <Container className="max-w-3xl rounded-[36px] border border-white/70 bg-white/85 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Feature flag</p>
        <h1 className="mt-3 font-display text-6xl leading-none">Esta seccion esta apagada</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/68">Si el ecommerce se deshabilita, el sitio institucional sigue funcionando y esta pantalla cubre la ruta sin romper el resto.</p>
        <Button as={Link} to="/" className="mt-8 bg-ink text-white">Volver al inicio</Button>
      </Container>
    </main>
  );
}

export default UnavailablePage;
