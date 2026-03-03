import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';

function CartPage() {
  const cart = JSON.parse(localStorage.getItem('mafalda_cart') || '[]');
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const clear = () => {
    localStorage.removeItem('mafalda_cart');
    window.location.reload();
  };

  return (
    <main className="bg-cream py-12">
      <Container>
        <h1 className="font-serif text-3xl">Carrito</h1>
        {cart.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-stone-600">Tu carrito está vacío.</p>
            <Button as={Link} to="/shop" className="mt-4 bg-stone-900 text-cream">Ir a comprar</Button>
          </Card>
        ) : (
          <Card className="mt-4">
            <ul className="space-y-2">
              {cart.map((item) => (
                <li key={item.productId} className="flex justify-between">
                  <span>{item.title} x {item.qty}</span>
                  <span>${item.price * item.qty}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold">Total: ${total}</p>
            <div className="mt-4 flex gap-3">
              <Button as={Link} to="/checkout" className="bg-terracotta text-white">Ir a checkout</Button>
              <Button as="button" onClick={clear} className="bg-stone-900 text-cream">Vaciar</Button>
            </div>
          </Card>
        )}
      </Container>
    </main>
  );
}

export default CartPage;
