import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ecommerceEnabled } from '../config/site';
import { useShop } from '../context/ShopContext';
import Button from './Button';
import Container from './Container';

function resolveHref(pathname, href) {
  return pathname === '/' ? href : `/${href}`;
}

function Header({ site }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount, isAuthenticated } = useShop();

  const navLinks = [
    ...site.navItems.map((item) => ({ ...item, href: resolveHref(location.pathname, item.href), external: false })),
    ...(ecommerceEnabled
      ? [
        { label: 'Tienda', href: '/shop' },
        { label: 'Impresiones', href: '/prints' },
      ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <Container>
        <div className="rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-lg font-bold text-white shadow-lg shadow-coral/30">M</span>
              <div>
                <p className="font-display text-2xl leading-none text-ink">{site.name}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral/80">Villa Maipu</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-semibold text-ink/70 lg:flex">
              {navLinks.map((item) => (
                item.href.startsWith('/') ? (
                  <Link key={item.label} to={item.href} className="transition hover:text-ink">
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className="transition hover:text-ink">
                    {item.label}
                  </a>
                )
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {ecommerceEnabled ? (
                <Button as={Link} to="/cart" className="bg-sun/45 text-ink">
                  Carrito {cartCount ? `(${cartCount})` : ''}
                </Button>
              ) : null}
              <Button as={Link} to={isAuthenticated ? '/profile' : '/login'} className="bg-ink text-white">
                {isAuthenticated ? 'Mi cuenta' : 'Ingresar'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral/20 bg-white text-ink lg:hidden"
              aria-label="Abrir menu"
            >
              {menuOpen ? 'x' : '='}
            </button>
          </div>

          {menuOpen ? (
            <div className="mt-4 grid gap-2 border-t border-stone-200 pt-4 lg:hidden">
              {navLinks.map((item) => (
                item.href.startsWith('/') ? (
                  <Link key={item.label} to={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sun/25" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sun/25" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                )
              ))}
              {ecommerceEnabled ? (
                <Link to="/cart" className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sun/25" onClick={() => setMenuOpen(false)}>
                  Carrito ({cartCount})
                </Link>
              ) : null}
              <Link to={isAuthenticated ? '/profile' : '/login'} className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>
                {isAuthenticated ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}

export default Header;
