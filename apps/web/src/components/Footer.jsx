import Container from './Container';

function Footer({ site }) {
  return (
    <footer className="pb-8 pt-16">
      <Container>
        <div className="rounded-[32px] border border-white/70 bg-ink px-6 py-10 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun">Libreria con ecommerce activo</p>
              <h3 className="mt-3 font-display text-4xl">{site.name}</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">Una experiencia simple para vender libreria, regalos e impresiones desde el barrio sin perder cercania.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun">Contacto</p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li>{site.address}</li>
                <li>{site.phone}</li>
                <li>{site.email}</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun">Horarios</p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {site.hours.map((item) => (
                  <li key={item.day}>{item.day}: {item.time}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
