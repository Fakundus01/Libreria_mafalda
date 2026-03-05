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

function TransferPage() {
  const { orderCode } = useParams();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiGet(`/api/payments/transfer/status/${orderCode}`)
      .then((res) => {
        if (!active) return;
        setStatus(res.data.status);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'No se pudo cargar el estado.');
      });

    return () => {
      active = false;
    };
  }, [orderCode]);

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />
      <main className="px-3 py-8 sm:py-10">
        <Container className="max-w-4xl">
          {!status && !error ? <PageLoader title="Cargando instrucciones" message="Estamos trayendo el estado de la transferencia." /> : null}
          {status ? (
            <Card className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Transferencia bancaria</p>
              <h1 className="mt-3 font-display text-5xl leading-none text-ink">Pedido {orderCode}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <StatusPill status={status} />
                <span className="rounded-full bg-[#fff4df] px-4 py-2 text-sm font-semibold text-ink">Alias MAFALDA.LIBRERIA</span>
              </div>
              <div className="mt-6 rounded-[28px] bg-ink p-6 text-sm leading-7 text-white/75">
                Transferi al alias MAFALDA.LIBRERIA y envia el comprobante por WhatsApp al 01131875770. Desde admin ya se puede aprobar o rechazar el pago y actualizar la orden.
              </div>
            </Card>
          ) : null}
          {error ? <Card className="text-sm text-berry">{error}</Card> : null}
        </Container>
      </main>
      <Footer site={siteConfig} />
    </div>
  );
}

export default TransferPage;
