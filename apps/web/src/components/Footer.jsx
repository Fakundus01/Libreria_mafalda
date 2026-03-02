import Container from './Container';

function Footer({ site }) {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 py-10 text-stone-200">
      <Container className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-serif text-2xl">{site.name}</h3>
          <p className="mt-2 text-sm text-stone-300">{site.address}</p>
          <p className="mt-1 text-sm text-stone-300">Tel: {site.phone}</p>
          <p className="mt-1 text-sm text-stone-300">Email: {site.email}</p>
        </div>
        <div>
          <h4 className="font-semibold uppercase tracking-wide text-stone-100">Horarios</h4>
          <ul className="mt-3 space-y-1 text-sm text-stone-300">
            {site.hours.map((item) => (
              <li key={item.day}>
                {item.day}: {item.time}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
