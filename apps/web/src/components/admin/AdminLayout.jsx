import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { useShop } from '../../context/ShopContext';
import Button from '../Button';
import Card from '../Card';
import Container from '../Container';
import Footer from '../Footer';
import Header from '../Header';

const sections = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Productos', to: '/admin/products' },
  { label: 'Pedidos', to: '/admin/orders' },
  { label: 'Clientes', to: '/admin/customers' },
  { label: 'Mensajes', to: '/admin/messages' },
];

function navClass({ isActive }) {
  return `rounded-full px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-ink text-white shadow-lg shadow-ink/10' : 'bg-white text-ink hover:bg-sun/30'}`;
}

function AdminLayout({ title, description, children, actions = null, showNav = true }) {
  const { adminUser, logoutAdmin } = useShop();

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Admin</p>
              <h1 className="mt-2 font-display text-5xl leading-none text-ink">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {adminUser ? <span className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink shadow-[0_12px_35px_rgba(15,23,42,0.08)]">Sesion: {adminUser.full_name}</span> : null}
              {actions}
              <Button as={Link} to="/shop" className="border border-stone-200 bg-white text-ink">
                Ver tienda
              </Button>
              <Button as="button" type="button" onClick={logoutAdmin} className="bg-ink text-white">
                Cerrar sesion
              </Button>
            </div>
          </div>

          {showNav ? (
            <Card className="mb-6 bg-[#fff2e6] p-4">
              <div className="flex flex-wrap gap-3">
                {sections.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </Card>
          ) : null}

          {children}
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default AdminLayout;
