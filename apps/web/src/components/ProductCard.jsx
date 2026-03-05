import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/format';
import Button from './Button';
import Card from './Card';

function ProductCard({ product, onAdd }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(255,122,89,0.18)]">
      <div className="relative overflow-hidden rounded-[24px] bg-[#fff1de]">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/900x700/FFE7CC/1F2937?text=Mafalda'}
          alt={product.title}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {product.is_offer ? <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">Oferta</span> : null}
          {product.stock <= 5 ? <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">Ultimas unidades</span> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral/80">{product.category || 'Libreria'}</p>
            <h3 className="mt-2 font-display text-3xl leading-none text-ink">{product.title}</h3>
          </div>
          <p className="rounded-full bg-sun/35 px-3 py-2 text-sm font-semibold text-ink">Stock {product.stock}</p>
        </div>

        <p className="mt-3 text-sm leading-6 text-ink/68">{product.description || 'Producto listo para mostrar en la tienda online.'}</p>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-ink/55">Precio final</p>
            <p className="font-display text-4xl leading-none text-ink">{formatCurrency(product.effective_price)}</p>
          </div>
          <Link to={`/product/${product.id}`} className="text-sm font-semibold text-coral transition hover:text-ink">
            Ver detalle
          </Link>
        </div>

        <Button as="button" type="button" onClick={() => onAdd(product)} className="mt-6 w-full bg-ink text-white">
          Agregar al carrito
        </Button>
      </div>
    </Card>
  );
}

export default ProductCard;
