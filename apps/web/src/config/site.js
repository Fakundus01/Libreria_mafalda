const rawPhone = '01131875770';
const whatsappPhone = '541131875770';
const address = 'Estrada 2380, B1650 Villa Maipu, Provincia de Buenos Aires';

export const ecommerceEnabled = (import.meta.env.VITE_ENABLE_ECOMMERCE || 'true').toLowerCase() === 'true';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const testProfile = {
  name: 'Facundo',
  email: 'facumoreno2001@gmail.com',
  phone: '1123971452',
  area: 'Villa Maipu',
  street: 'Estrada',
  number: '2380',
  refs: 'Timbre Libreria Mafalda',
};

export const siteConfig = {
  name: 'Libreria Mafalda',
  tagline: 'Papeleria, libros, regalos e impresiones con energia de barrio.',
  phone: rawPhone,
  email: 'mafaldalibreria@hotmail.com',
  address,
  hours: [
    { day: 'Lunes a viernes', time: '9:00 a 15:00' },
    { day: 'Sabados', time: '9:00 a 13:00' },
  ],
  navItems: [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Destacados', href: '#destacados' },
    { label: 'Contacto', href: '#contacto' },
  ],
  links: {
    whatsapp: `https://wa.me/${whatsappPhone}`,
    maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  },
  heroStats: [
    { value: '12+', label: 'productos listos para demo real' },
    { value: '24 hs', label: 'seguimiento simple por mail o WhatsApp' },
    { value: '2 pasos', label: 'checkout rapido con retiro o envio local' },
  ],
  services: [
    {
      title: 'Escolar y oficina',
      description: 'Cuadernos, resmas, lapices, carpetas y todo lo que mas rota en el barrio.',
    },
    {
      title: 'Regalos con onda',
      description: 'Agendas, sets, cartucheras y combos para regalar sin caer en lo obvio.',
    },
    {
      title: 'Libros para todas las edades',
      description: 'Lecturas para chicos, novelas para regalar y clasicos que siempre salen.',
    },
    {
      title: 'Impresiones y copias',
      description: 'Pedidos express con tracking simple para estudiantes y emprendedores.',
    },
  ],
  promises: [
    'Checkout como invitado o con cuenta.',
    'Mercado Pago mockeado si falta token y transferencia lista para operar.',
    'Panel admin para ver pedidos e impresiones.',
  ],
};

export const featuredItems = [
  {
    name: 'Cuaderno pastel tapa dura',
    price: '$7.500',
    description: 'El clasico que resuelve escuela, facu y oficina.',
  },
  {
    name: 'Set de marcadores felices',
    price: '$6.200',
    description: 'Color fuerte, punta pareja y salida rapida para regalo.',
  },
  {
    name: 'Agenda 2026 aurora',
    price: '$9.400',
    description: 'Una agenda linda vende sola cuando se muestra bien.',
  },
];
