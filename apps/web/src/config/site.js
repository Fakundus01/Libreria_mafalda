const rawPhone = '01131875770';
const whatsappPhone = '541131875770';
const address = 'Estrada 2380, B1650 Villa Maipú, Provincia de Buenos Aires';

export const siteConfig = {
  name: 'Librería Mafalda',
  tagline: 'Tu librería de barrio en Villa Maipú',
  phone: rawPhone,
  email: 'mafaldalibreria@hotmail.com',
  address,
  hours: [
    { day: 'Lunes a viernes', time: '9:00 a 15:00' },
    { day: 'Sábados', time: '9:00 a 13:00' },
  ],
  navItems: [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Destacados', href: '#destacados' },
    { label: 'Ubicación', href: '#ubicacion' },
    { label: 'Contacto', href: '#contacto' },
  ],
  links: {
    whatsapp: `https://wa.me/${whatsappPhone}`,
    maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  },
  services: [
    {
      title: 'Útiles escolares',
      description: 'Todo para cada etapa escolar: cuadernos, mochilas, carpetas y más.',
    },
    {
      title: 'Libros y novelas',
      description: 'Lecturas para grandes y chicos, clásicos y novedades para regalar.',
    },
    {
      title: 'Papelería',
      description: 'Sobres, hojas, agendas y artículos de escritorio para uso diario.',
    },
    {
      title: 'Regalería',
      description: 'Detalles especiales con estilo artesanal y presentación cuidada.',
    },
    {
      title: 'Impresiones y fotocopias',
      description: 'Servicio rápido para estudiantes, vecinos y emprendedores del barrio.',
      optional: true,
    },
  ],
};

export const featuredItems = [
  { name: 'Cuaderno tapa dura', price: '$7.500' },
  { name: 'Set de marcadores', price: '$6.200' },
  { name: 'Novela bestseller', price: '$12.900' },
  { name: 'Agenda 2026', price: '$9.400' },
  { name: 'Kit escolar básico', price: '$15.700' },
  { name: 'Combo regalería', price: '$11.300' },
];
