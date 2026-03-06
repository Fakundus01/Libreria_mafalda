import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import EmptyState from '../components/EmptyState';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../hooks/useShop';
import { formatCurrency } from '../lib/format';

function CartPage() {
  const { cart, cartTotal, clearCart, removeFromCart, updateQty } = useShop();

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Carrito</p>
              <h1 className="mt-3 font-display text-5xl leading-none text-ink sm:text-6xl">Tu seleccion lista para cerrar la compra</h1>

              {cart.length === 0 ? (
                <div className="mt-8">
                  <EmptyState
                    title="El carrito esta vacio"
                    message="Todavia no hay productos cargados. Volve a tienda y proba el flujo completo con stock real y checkout activo."
                    actionLabel="Ir a tienda"
                    actionProps={{ as: Link, to: '/shop', className: 'bg-ink text-white' }}
                  />
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {cart.map((item, index) => (
                    <Card key={item.productId} className="cart-entry flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: `${index * 90}ms` }}>
                      <div className="flex gap-4">
                        <img src={item.image || 'https://placehold.co/320x320/FFE7CC/1F2937?text=Mafalda'} alt={item.title} className="h-24 w-24 rounded-[24px] object-cover shadow-[0_14px_30px_rgba(255,122,89,0.16)]" />
                        <div>
                          <h2 className="font-display text-3xl leading-none text-ink">{item.title}</h2>
                          <p className="mt-2 text-sm text-ink/60">Precio unitario {formatCurrency(item.price)}</p>
                          <button type="button" onClick={() => removeFromCart(item.productId)} className="mt-3 text-sm font-semibold text-coral transition hover:-translate-y-0.5">
                            Quitar producto
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                        <div className="flex items-center rounded-full border border-stone-200 bg-white px-3 py-2 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
                          <button type="button" className="qty-chip h-10 w-10 rounded-full bg-[#fff4df] text-lg" onClick={() => updateQty(item.productId, item.qty - 1)}>-</button>
                          <span className="min-w-12 px-4 text-center text-lg font-semibold">{item.qty}</span>
                          <button type="button" className="qty-chip h-10 w-10 rounded-full bg-[#fff4df] text-lg" onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
                        </div>
                        <p className="min-w-32 text-right font-display text-3xl leading-none text-ink">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Card className="cart-summary sticky top-28 bg-ink p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Resumen</p>
                <h2 className="mt-3 font-display text-4xl">Listo para checkout</h2>
                <div className="mt-6 grid gap-4 rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Envio local</span>
                    <span>Se define en checkout</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-4 font-display text-3xl text-white">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <Button as={Link} to="/checkout" className="mt-6 w-full bg-white text-ink" disabled={!cart.length}>
                  Continuar compra
                </Button>
                <Button as="button" type="button" onClick={clearCart} className="mt-3 w-full bg-white/10 text-white" disabled={!cart.length}>
                  Vaciar carrito
                </Button>
                <p className="mt-5 text-sm text-white/70">Aceptamos Mercado Pago y transferencia con seguimiento simple por codigo de pedido.</p>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default CartPage;
