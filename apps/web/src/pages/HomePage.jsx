import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Section from '../components/Section';
import Container from '../components/Container';
import { featuredItems, siteConfig } from '../config/site';

function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = `${siteConfig.name} | Librería en Villa Maipú`;
    const description = 'Landing demo de Librería Mafalda: servicios, destacados, contacto y ubicación en Villa Maipú.';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description;
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Ingresá tu nombre.';
    if (!formData.email.includes('@')) nextErrors.email = 'Ingresá un email válido.';
    if (formData.message.trim().length < 8) nextErrors.message = 'Tu mensaje debe tener al menos 8 caracteres.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      alert('Mensaje enviado (demo)');
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="bg-cream text-stone-800">
      <Header site={siteConfig} />

      <main>
        <section id="inicio" className="scroll-mt-24 py-20 sm:py-28">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge>Librería de barrio</Badge>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">{siteConfig.name}</h1>
              <p className="mt-4 text-lg text-stone-700">{siteConfig.tagline}</p>
              <p className="mt-3 max-w-xl text-stone-600">
                Un espacio cálido para encontrar útiles, libros, papelería y regalos con atención cercana para cada vecino.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={siteConfig.links.whatsapp} target="_blank" rel="noreferrer" className="bg-emerald-900 text-cream">
                  Escribinos por WhatsApp
                </Button>
                <Button href={siteConfig.links.maps} target="_blank" rel="noreferrer" className="border border-stone-300 bg-white text-stone-800">
                  Cómo llegar
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/30">
              <img
                src="https://placehold.co/900x600/EDE5D9/4F3E31?text=Librer%C3%ADa+Mafalda"
                alt="Mostrador de librería"
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
          </Container>
        </section>

        <Section id="servicios" title="Servicios" subtitle="Soluciones prácticas para escuela, trabajo y regalos.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteConfig.services.map((service) => (
              <Card key={service.title}>
                <h3 className="font-serif text-xl text-stone-900">{service.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{service.description}</p>
                {service.optional && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-terracotta">Opcional</p>}
              </Card>
            ))}
          </div>
        </Section>

        <Section id="destacados" title="Destacados" subtitle="Una selección demo de productos populares.">
          <Badge>Próximamente catálogo online</Badge>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <Card key={item.name}>
                <img
                  src="https://placehold.co/600x380/D8C9B5/4F3E31?text=Producto"
                  alt={item.name}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <h3 className="mt-4 font-serif text-xl">{item.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{item.price}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="ubicacion" title="Ubicación" subtitle="Te esperamos en Villa Maipú.">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="text-stone-700">{siteConfig.address}</p>
              <Button href={siteConfig.links.maps} target="_blank" rel="noreferrer" className="mt-5 bg-stone-900 text-cream">
                Abrir en Google Maps
              </Button>
            </Card>
            <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
              <iframe
                title="Mapa Librería Mafalda"
                src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed`}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Section>

        <Section id="contacto" title="Contacto" subtitle="Escribinos y coordinamos tu pedido.">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <ul className="space-y-2 text-sm text-stone-700">
                <li>
                  <strong>Teléfono:</strong> {siteConfig.phone}
                </li>
                <li>
                  <strong>Email:</strong> {siteConfig.email}
                </li>
                <li>
                  <strong>Dirección:</strong> {siteConfig.address}
                </li>
              </ul>
              <h3 className="mt-6 font-serif text-xl">Horarios</h3>
              <ul className="mt-2 space-y-1 text-sm text-stone-700">
                {siteConfig.hours.map((item) => (
                  <li key={item.day}>
                    {item.day}: {item.time}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="name">
                    Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none ring-0 focus:border-emerald-900"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none ring-0 focus:border-emerald-900"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="message">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none ring-0 focus:border-emerald-900"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>

                <Button as="button" type="submit" className="w-full bg-terracotta text-white">
                  Enviar mensaje
                </Button>
              </form>
            </Card>
          </div>
        </Section>
      </main>

      <Footer site={siteConfig} />
    </div>
  );
}

export default HomePage;
