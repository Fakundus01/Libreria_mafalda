import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { featuredItems, siteConfig } from '../config/site';
import { useShop } from '../context/ShopContext';
import { apiPost } from '../lib/api';

function HomePage() {
  const { customerProfile } = useShop();
  const [formData, setFormData] = useState({ name: customerProfile.name, email: customerProfile.email, message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = `${siteConfig.name} | Tienda online`;
    const description = 'Libreria Mafalda con ecommerce, impresiones y experiencia de compra alegre en Villa Maipu.';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Ingresa tu nombre.';
    if (!formData.email.includes('@')) nextErrors.email = 'Ingresa un email valido.';
    if (formData.message.trim().length < 8) nextErrors.message = 'El mensaje debe tener al menos 8 caracteres.';

    setErrors(nextErrors);
    setStatus('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await apiPost('/api/contact', formData);
      setStatus('Mensaje enviado. Te respondemos por mail o WhatsApp.');
      setFormData({ name: customerProfile.name, email: customerProfile.email, message: '' });
    } catch (error) {
      setStatus(error.message || 'No pudimos enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden pb-6 text-ink">
      <Header site={siteConfig} />

      <main>
        <section id="inicio" className="px-3 pb-12 pt-8 sm:pb-16 sm:pt-10">
          <Container>
            <div className="hero-panel rounded-[40px] border border-white/70 bg-white/78 px-6 py-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 sm:py-12">
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative z-10">
                  <span className="inline-flex rounded-full bg-coral px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-coral/25">
                    Ecommerce listo para vender
                  </span>
                  <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                    Una tienda alegre para vender libreria, regalos e impresiones sin friccion.
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
                    Dejamos el front mas vivo, con carrito real, checkout funcional, guards, loaders y datos tuyos precargados para probar sin perder tiempo.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button as={Link} to="/shop" className="bg-ink text-white">
                      Ir a la tienda
                    </Button>
                    <Button as={Link} to="/prints" className="bg-white text-ink border border-stone-200">
                      Probar impresiones
                    </Button>
                    <Button as="a" href={siteConfig.links.whatsapp} target="_blank" rel="noreferrer" className="bg-sun/55 text-ink">
                      WhatsApp directo
                    </Button>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    {siteConfig.heroStats.map((item) => (
                      <div key={item.label} className="rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                        <p className="font-display text-4xl text-ink">{item.value}</p>
                        <p className="mt-2 text-sm text-ink/65">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 grid gap-4">
                  <Card className="animate-float bg-gradient-to-br from-white to-[#fff1de] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral/80">Modo prueba activado</p>
                    <h2 className="mt-3 font-display text-3xl text-ink">Tus datos ya estan cargados</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/45">WhatsApp</p>
                        <p className="mt-2 text-sm font-semibold text-ink">{customerProfile.phone}</p>
                      </div>
                      <div className="rounded-[24px] bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Mail</p>
                        <p className="mt-2 text-sm font-semibold text-ink break-all">{customerProfile.email}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-ink/65">Checkout, signup, impresiones y contacto arrancan con esta informacion para testear rapido.</p>
                  </Card>

                  <Card className="bg-ink text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Operativa</p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80">
                      {siteConfig.promises.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="servicios" className="px-3 py-10 sm:py-14">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Servicios</p>
                <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Todo lo que el local necesita mostrar online</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-ink/65">La experiencia no queda limitada al catalogo: tambien contempla consultas, impresiones y seguimiento.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {siteConfig.services.map((service, index) => (
                <Card key={service.title} className={`${index % 2 === 0 ? 'bg-white/92' : 'bg-[#fff4df]'} min-h-[220px]`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-lg font-bold text-coral">0{index + 1}</div>
                  <h3 className="mt-5 font-display text-3xl text-ink">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/68">{service.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section id="destacados" className="px-3 py-10 sm:py-14">
          <Container>
            <div className="rounded-[34px] bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sun">Destacados visuales</p>
                  <h2 className="mt-2 font-display text-4xl sm:text-5xl">Mockups listos para vender mejor</h2>
                </div>
                <Button as={Link} to="/shop" className="bg-white text-ink">
                  Ver catalogo completo
                </Button>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {featuredItems.map((item, index) => (
                  <div key={item.name} className="rounded-[28px] bg-white/10 p-4 backdrop-blur">
                    <div className={`h-56 rounded-[24px] ${index === 1 ? 'bg-gradient-to-br from-sun/70 to-coral/80' : 'bg-gradient-to-br from-white/90 to-mint/55'} p-5`}>
                      <div className="flex h-full flex-col justify-between rounded-[22px] border border-white/35 bg-white/35 p-5 text-ink backdrop-blur">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] w-fit">Nuevo</span>
                        <div>
                          <p className="font-display text-3xl leading-none">{item.name}</p>
                          <p className="mt-3 text-sm text-ink/70">{item.description}</p>
                          <p className="mt-5 font-display text-4xl">{item.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="contacto" className="px-3 py-10 sm:py-14">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="bg-[#fff2e6]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Contacto rapido</p>
                <h2 className="mt-3 font-display text-4xl text-ink">Canales claros para cerrar ventas</h2>
                <p className="mt-4 text-sm leading-7 text-ink/68">Si un cliente no compra online, puede escribir por WhatsApp, consultar por mail o pasar por el local.</p>
                <div className="mt-6 space-y-4 text-sm text-ink/75">
                  <p><strong>Direccion:</strong> {siteConfig.address}</p>
                  <p><strong>Telefono:</strong> {siteConfig.phone}</p>
                  <p><strong>Email:</strong> {siteConfig.email}</p>
                </div>
                <div className="mt-8 overflow-hidden rounded-[28px] border border-white/70">
                  <iframe
                    title="Mapa Libreria Mafalda"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed`}
                    className="h-72 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/80">Escribinos</p>
                <h2 className="mt-3 font-display text-4xl text-ink">Formulario conectado</h2>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80" htmlFor="name">Nombre</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" />
                    {errors.name ? <p className="mt-2 text-sm text-berry">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="input-field" />
                    {errors.email ? <p className="mt-2 text-sm text-berry">{errors.email}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink/80" htmlFor="message">Mensaje</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="textarea-field" />
                    {errors.message ? <p className="mt-2 text-sm text-berry">{errors.message}</p> : null}
                  </div>
                  {status ? <p className="text-sm text-ink/70">{status}</p> : null}
                  <Button as="button" type="submit" disabled={loading} className="w-full bg-coral text-white">
                    {loading ? 'Enviando...' : 'Enviar consulta'}
                  </Button>
                </form>
              </Card>
            </div>
          </Container>
        </section>
      </main>

      <Footer site={siteConfig} />
    </div>
  );
}

export default HomePage;
