import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';

function PrintsPage() {
  const { customerProfile } = useShop();
  const [form, setForm] = useState({
    customer_name: customerProfile.name,
    customer_email: customerProfile.email,
    customer_phone: customerProfile.phone,
    notes: 'PDF A4 simple faz, 10 paginas.',
  });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost('/api/prints', {
        ...form,
        files: [],
        specs: { pages: 10, color_bw: 'BW', double_sided: false, paper_size: 'A4', notes: form.notes },
      });
      setResult(res.data.print_code);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card className="bg-[#fff2e6] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Impresiones</p>
              <h1 className="mt-3 font-display text-5xl leading-none text-ink">Mock listo para pedidos express</h1>
              <p className="mt-4 text-sm leading-7 text-ink/68">La pantalla ya viene con tus datos precargados para probar el flujo end to end y despues seguir el pedido por codigo.</p>
              {result ? (
                <div className="mt-8 rounded-[28px] bg-mint/20 p-5 text-sm text-lagoon">
                  <p className="font-semibold">Solicitud creada: {result}</p>
                  <Link to={`/prints/${result}`} className="mt-2 inline-flex font-semibold underline">
                    Abrir seguimiento
                  </Link>
                </div>
              ) : null}
            </Card>

            <Card className="p-8">
              <h2 className="font-display text-4xl text-ink">Cargar pedido</h2>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Nombre</label>
                  <input className="input-field" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Email</label>
                  <input className="input-field" value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Telefono</label>
                  <input className="input-field" value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink/80">Notas</label>
                  <textarea className="textarea-field" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                </div>
                {error ? <p className="text-sm text-berry">{error}</p> : null}
                <Button as="button" type="submit" disabled={loading} className="w-full bg-coral text-white">
                  {loading ? 'Enviando...' : 'Enviar pedido de impresion'}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default PrintsPage;
