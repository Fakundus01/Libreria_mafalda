import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import { apiGet } from '../lib/api';

function TransferPage() {
  const { orderCode } = useParams();
  const [status, setStatus] = useState('Cargando...');

  useEffect(() => {
    apiGet(`/api/payments/transfer/status/${orderCode}`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('No se pudo cargar. Intentá nuevamente.'));
  }, [orderCode]);

  return (
    <main className="bg-cream py-12">
      <Container className="max-w-xl">
        <h1 className="font-serif text-3xl">Transferencia bancaria</h1>
        <p className="mt-3">Pedido: {orderCode}</p>
        <p className="mt-2 text-sm">Alias: MAFALDA.LIBRERIA</p>
        <p className="mt-2 text-sm">Estado: {status}</p>
      </Container>
    </main>
  );
}

export default TransferPage;
