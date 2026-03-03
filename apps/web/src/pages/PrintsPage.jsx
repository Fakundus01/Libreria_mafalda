import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiPost } from '../lib/api';

function PrintsPage() {
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', notes: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const res = await apiPost('/api/prints', {
        ...form,
        files: [],
        specs: { pages: 10, color_bw: 'BW', double_sided: false, paper_size: 'A4', notes: form.notes },
      });
      setResult(res.data.print_code);
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <main className="bg-cream py-12">
      <Container className="max-w-2xl">
        <Card>
          <h1 className="font-serif text-3xl">Pedidos de impresiones</h1>
          <p className="mt-2 text-sm text-stone-600">Completá tus datos y te contactamos.</p>
          <form className="mt-5 space-y-3" onSubmit={submit}>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Teléfono" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
            <textarea className="w-full rounded-xl border px-3 py-2" placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button as="button" type="submit" className="w-full bg-terracotta text-white">Enviar pedido</Button>
          </form>
          {result && <p className="mt-4 text-sm text-emerald-700">Solicitud creada. Código: {result}</p>}
        </Card>
      </Container>
    </main>
  );
}

export default PrintsPage;
