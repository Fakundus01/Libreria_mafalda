import { Link } from 'react-router-dom';
import { ecommerceEnabled } from '../config/site';
import Container from './Container';

function Header({ site }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-cream/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-xl text-stone-900">
          {site.name}
        </Link>
        <nav className="hidden gap-5 text-sm font-medium text-stone-700 md:flex">
          {site.navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-stone-950">
              {item.label}
            </a>
          ))}
          {ecommerceEnabled ? (
            <>
              <Link to="/shop" className="transition hover:text-stone-950">Tienda</Link>
              <Link to="/cart" className="transition hover:text-stone-950">Carrito</Link>
              <Link to="/prints" className="transition hover:text-stone-950">Impresiones</Link>
              <Link to="/login" className="transition hover:text-stone-950">Ingresar</Link>
            </>
          ) : (
            <Link to="/catalogo" className="transition hover:text-stone-950">Catálogo</Link>
          )}
        </nav>
      </Container>
    </header>
  );
}

export default Header;
