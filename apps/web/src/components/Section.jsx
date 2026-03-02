import Container from './Container';

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-20">
      <Container>
        {(title || subtitle) && (
          <div className="mb-10 max-w-2xl">
            {title && <h2 className="font-serif text-3xl text-stone-900 sm:text-4xl">{title}</h2>}
            {subtitle && <p className="mt-3 text-stone-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

export default Section;
