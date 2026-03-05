import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
import StatusPill from '../components/StatusPill';
import { siteConfig } from '../config/site';
import { apiGet } from '../lib/api';

function PrintTrackingPage() {
  const { printCode } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiGet(`/api/prints/${printCode}`)
      .then((res) => {
        if (!active) return;
        setItem(res.data);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'No encontramos la solicitud.');
      });

    return () => {
      active = false;
    };
  }, [printCode]);

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container className="max-w-4xl">
          {!item && !error ? <PageLoader title="Buscando impresion" message="Estamos cargando el estado del pedido." /> : null}
          {error ? (
            <Card className="text-center">
              <h1 className="font-display text-4xl text-ink">Tracking no disponible</h1>
              <p className="mt-3 text-sm text-berry">{error}</p>
            </Card>
          ) : null}
          {item ? (
            <Card className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Seguimiento</p>
              <h1 className="mt-3 font-display text-5xl leading-none text-ink">{item.print_code}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <StatusPill status={item.status} />
                <p className="text-sm text-ink/65">Cliente: {item.customer_name}</p>
              </div>
              <p className="mt-6 text-sm leading-7 text-ink/68">El tracking ya esta operativo. Cuando el admin cambie el estado, esta vista refleja el avance del pedido.</p>
            </Card>
          ) : null}
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default PrintTrackingPage;
