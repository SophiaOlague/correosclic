/**
 * Contenido editorial de la portada: tiendas destacadas, testimonios y
 * preguntas frecuentes. Es copy de marketing del diseño de Figma, no datos
 * del catálogo.
 *
 * TODO: Backend integration pending — "Tiendas destacadas" sí tiene modelo
 * (`Tienda`) pero no endpoint de lectura; testimonios y FAQs no existen en el
 * esquema y probablemente pertenezcan a un CMS, no a la API.
 */
export const STORES = [
  { name: "TechStore MX", category: "Electrónica", rating: 4.9, sales: "12,400+", color: "from-blue-600 to-blue-400",    initial: "T" },
  { name: "NikeOfficial", category: "Deportes",    rating: 4.8, sales: "8,200+",  color: "from-slate-800 to-slate-600",  initial: "N" },
  { name: "Moda Urbana",  category: "Moda",        rating: 4.7, sales: "6,800+",  color: "from-[#E4007C] to-pink-400",   initial: "M" },
  { name: "Samsung MX",   category: "Electrónica", rating: 4.9, sales: "15,100+", color: "from-blue-900 to-blue-700",    initial: "S" },
];

export const TESTIMONIALS = [
  { name: "María González", city: "CDMX", rating: 5, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format", text: "Increíble experiencia. Compré unos audífonos y llegaron en 2 días perfectamente empacados. El rastreo con Correos fue exacto en todo momento. ¡Ya hice mi cuarta compra!" },
  { name: "Carlos Ramírez", city: "Guadalajara", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format", text: "Lo que más me convenció fue la protección de compra. Tuve un problema con un artículo y en menos de 24 horas me ofrecieron reembolso completo. Servicio de primer nivel." },
  { name: "Sofía Torres", city: "Monterrey", rating: 5, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format", text: "Por fin un marketplace mexicano que entiende lo que necesitamos. Los precios son competitivos, la variedad es enorme y la entrega llega hasta mi colonia. Totalmente recomendado." },
];

export const FAQS = [
  { q: "¿Cómo realizo mi primer pedido en CorreosClic?", a: "Es muy sencillo: crea tu cuenta gratis, busca el producto que deseas, agrégalo al carrito y elige tu método de pago. Aceptamos tarjetas de débito y crédito, OXXO Pay, transferencia SPEI y más. Tu pedido queda confirmado en segundos." },
  { q: "¿Cuánto tarda el envío y cuánto cuesta?", a: "El tiempo de entrega es de 2 a 7 días hábiles dependiendo de tu ubicación. La mayoría de los productos con el sello 'Envío gratis' no tienen costo adicional. También ofrecemos envío express a CDMX y área metropolitana en 24 horas." },
  { q: "¿Cómo puedo rastrear mi paquete?", a: "Una vez que tu pedido sea enviado, recibirás un número de guía por correo electrónico. Puedes rastrear tu paquete en tiempo real desde tu cuenta en la sección 'Mis pedidos' o directamente en la web de Correos de México." },
  { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas Visa, Mastercard y American Express (débito y crédito), pagos en OXXO, 7-Eleven y farmacias, transferencia SPEI, Mercado Pago, PayPal y financiamiento hasta 18 meses sin intereses con bancos participantes." },
  { q: "¿Cómo funciona la garantía de devolución?", a: "Tienes 30 días naturales a partir de la entrega para solicitar una devolución si el producto no cumple con lo descrito o llegó dañado. El proceso es 100% en línea desde tu cuenta. El reembolso se acredita en 3 a 5 días hábiles." },
  { q: "¿Puedo vender mis productos en CorreosClic?", a: "¡Claro que sí! Crear tu tienda en CorreosClic es completamente gratis. Solo necesitas tu RFC, identificación oficial y una cuenta bancaria. Nosotros nos encargamos de la logística con Correos de México y tú te concentras en vender." },
];

