import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import { apiGet } from '../lib/api';

function PrintTrackingPage() {
  const { printCode } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet(`/api/prints/${printCode}`)
      .then((res) => setItem(res.data))
      .catch(() => setError('No encontramos lo que buscás.'));
  }, [printCode]);

  return (
    <main className="bg-cream py-12">
      <Container>
        <h1 className="font-serif text-3xl">Tracking de impresión</h1>
        {error && <p className="mt-3 text-red-600">{error}</p>}
        {item && <p className="mt-3">{item.print_code} - {item.status}</p>}
      </Container>
    </main>
  );
}

export default PrintTrackingPage;
