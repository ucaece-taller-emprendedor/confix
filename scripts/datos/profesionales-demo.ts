// Profesionales de ejemplo (DEMO). Nombres, fotos y reseñas son ficticios (los mismos de la versión original de CONFIX).
type ServicioDemo = { id: string; nombre: string; detalle: string; precio: number; unidad: string }
export type ProfesionalDemo = {
  id: string
  nombre: string
  categoria: string
  oficio: string
  foto: string
  puntaje: number
  cantidadResenas: number
  distanciaKm: number
  barrio: string
  disponibleHoy: boolean
  dias: string[]
  horario: string
  anosExperiencia: number
  trabajosRealizados: number
  respuesta: string
  descripcion: string
  costoVisita: number
  servicios: ServicioDemo[]
  resenas: { autor: string; puntaje: number; fecha: string; texto: string }[]
}
export const PROFESIONALES_DEMO: ProfesionalDemo[] = [
  {
    id: 'esteban-gomez',
    nombre: 'Esteban Gómez',
    categoria: 'carpinteria',
    oficio: 'Carpintero',
    foto: '/profesionales/esteban-gomez.webp',
    puntaje: 4.9,
    cantidadResenas: 128,
    distanciaKm: 1.2,
    barrio: 'Palermo',
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    horario: '8:00 a 18:00',
    anosExperiencia: 18,
    trabajosRealizados: 460,
    respuesta: 'Responde en 15 min',
    descripcion:
      'Carpintero con más de 18 años de oficio. Me dedico a muebles a medida, restauración de puertas y placards, y reparaciones del hogar. Trabajo prolijo, con materiales de calidad y presupuesto claro desde el primer día.',
    costoVisita: 6000,
    servicios: [
      { id: 'eg-1', nombre: 'Reparación de puertas y ventanas', detalle: 'Ajuste, bisagras, cerraduras y marcos', precio: 22000, unidad: 'por trabajo' },
      { id: 'eg-2', nombre: 'Armado de muebles', detalle: 'Placards, bibliotecas y muebles de kit', precio: 15000, unidad: 'por mueble' },
      { id: 'eg-3', nombre: 'Mueble a medida', detalle: 'Diseño, fabricación e instalación', precio: 120000, unidad: 'desde' },
      { id: 'eg-4', nombre: 'Restauración de muebles', detalle: 'Lijado, barnizado y recuperación', precio: 35000, unidad: 'por mueble' },
    ],
    resenas: [
      { autor: 'Mariana L.', puntaje: 5, fecha: 'Hace 1 semana', texto: 'Esteban me hizo un placard a medida y quedó impecable. Puntual, ordenado y súper amable.' },
      { autor: 'Federico R.', puntaje: 5, fecha: 'Hace 3 semanas', texto: 'Arregló todas las puertas del departamento en una mañana. Muy recomendable.' },
      { autor: 'Sofía M.', puntaje: 4, fecha: 'Hace 1 mes', texto: 'Muy buen trabajo y precio justo. Se demoró un poco con el barniz pero el resultado vale la pena.' },
    ],
  },
  {
    id: 'juan-pereyra',
    nombre: 'Juan Pereyra',
    categoria: 'plomeria',
    oficio: 'Plomero',
    foto: '/profesionales/juan-pereyra.webp',
    puntaje: 4.8,
    cantidadResenas: 214,
    distanciaKm: 0.8,
    barrio: 'Palermo',
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    horario: '7:00 a 21:00',
    anosExperiencia: 12,
    trabajosRealizados: 820,
    respuesta: 'Responde en 10 min',
    descripcion:
      'Plomero matriculado con atención de urgencias. Resuelvo pérdidas, destapes, instalación de termotanques y griferías. Llego con las herramientas y los repuestos básicos para solucionarlo en la primera visita.',
    costoVisita: 5000,
    servicios: [
      { id: 'jp-1', nombre: 'Destape de cañerías', detalle: 'Cocina, baño y desagües', precio: 18000, unidad: 'por trabajo' },
      { id: 'jp-2', nombre: 'Reparación de pérdidas', detalle: 'Canillas, flexibles y caños', precio: 16000, unidad: 'por trabajo' },
      { id: 'jp-3', nombre: 'Instalación de termotanque', detalle: 'Eléctrico o a gas, con conexiones', precio: 45000, unidad: 'por equipo' },
      { id: 'jp-4', nombre: 'Cambio de grifería', detalle: 'Cocina, baño y lavadero', precio: 14000, unidad: 'por grifería' },
    ],
    resenas: [
      { autor: 'Laura P.', puntaje: 5, fecha: 'Hace 3 días', texto: 'Vino el mismo día por una pérdida bajo la mesada. Rápido, prolijo y explicó todo.' },
      { autor: 'Nicolás B.', puntaje: 5, fecha: 'Hace 2 semanas', texto: 'Instaló el termotanque sin problemas. Dejó todo limpio. Excelente atención.' },
      { autor: 'Carla D.', puntaje: 4, fecha: 'Hace 1 mes', texto: 'Muy profesional. Lo único, llegó 20 minutos tarde pero avisó.' },
    ],
  },
  {
    id: 'lucia-fernandez',
    nombre: 'Lucía Fernández',
    categoria: 'electricidad',
    oficio: 'Electricista',
    foto: '/profesionales/lucia-fernandez.webp',
    puntaje: 4.9,
    cantidadResenas: 176,
    distanciaKm: 1.8,
    barrio: 'Villa Crespo',
    disponibleHoy: false,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    horario: '9:00 a 19:00',
    anosExperiencia: 9,
    trabajosRealizados: 390,
    respuesta: 'Responde en 30 min',
    descripcion:
      'Electricista matriculada. Instalaciones nuevas, cambio de tableros, tomas, luminarias y detección de fallas. Trabajo con normas de seguridad y entrego certificado de instalación cuando se necesita.',
    costoVisita: 5500,
    servicios: [
      { id: 'lf-1', nombre: 'Instalación de tomas y llaves', detalle: 'Reemplazo y nuevas bocas', precio: 9000, unidad: 'por boca' },
      { id: 'lf-2', nombre: 'Cambio de tablero eléctrico', detalle: 'Térmicas y disyuntor incluidos', precio: 68000, unidad: 'por tablero' },
      { id: 'lf-3', nombre: 'Instalación de luminarias', detalle: 'Plafones, spots y apliques', precio: 12000, unidad: 'por punto' },
      { id: 'lf-4', nombre: 'Detección de fallas', detalle: 'Cortocircuitos y saltos de térmica', precio: 20000, unidad: 'por visita' },
    ],
    resenas: [
      { autor: 'Julián S.', puntaje: 5, fecha: 'Hace 5 días', texto: 'Cambió el tablero completo en una tarde. Muy clara con el presupuesto.' },
      { autor: 'Paula G.', puntaje: 5, fecha: 'Hace 3 semanas', texto: 'Encontró la falla que otros dos electricistas no pudieron. 100% recomendable.' },
    ],
  },
  {
    id: 'martin-acosta',
    nombre: 'Martín Acosta',
    categoria: 'pintura',
    oficio: 'Pintor',
    foto: '/profesionales/martin-acosta.webp',
    puntaje: 4.7,
    cantidadResenas: 97,
    distanciaKm: 2.4,
    barrio: 'Colegiales',
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    horario: '8:00 a 17:00',
    anosExperiencia: 11,
    trabajosRealizados: 310,
    respuesta: 'Responde en 1 h',
    descripcion:
      'Pintor de interiores y exteriores. Preparo bien las superficies, cubro muebles y pisos, y dejo el ambiente limpio al terminar. Asesoro en colores y tipos de pintura según cada espacio.',
    costoVisita: 4000,
    servicios: [
      { id: 'ma-1', nombre: 'Pintura de ambiente', detalle: 'Paredes y techo, hasta 20 m²', precio: 55000, unidad: 'por ambiente' },
      { id: 'ma-2', nombre: 'Pintura de fachada', detalle: 'Con andamio o escalera', precio: 4500, unidad: 'por m²' },
      { id: 'ma-3', nombre: 'Reparación de humedad', detalle: 'Tratamiento y pintura', precio: 38000, unidad: 'por trabajo' },
      { id: 'ma-4', nombre: 'Pintura de aberturas', detalle: 'Puertas, ventanas y rejas', precio: 18000, unidad: 'por abertura' },
    ],
    resenas: [
      { autor: 'Ana C.', puntaje: 5, fecha: 'Hace 2 semanas', texto: 'Pintó todo el living y quedó espectacular. Muy prolijo con las terminaciones.' },
      { autor: 'Tomás V.', puntaje: 4, fecha: 'Hace 1 mes', texto: 'Buen trabajo y buena onda. Cumplió con los tiempos.' },
    ],
  },
  {
    id: 'carolina-ruiz',
    nombre: 'Carolina Ruiz',
    categoria: 'pintura',
    oficio: 'Pintora y decoradora',
    foto: '/profesionales/carolina-ruiz.webp',
    puntaje: 4.8,
    cantidadResenas: 143,
    distanciaKm: 3.1,
    barrio: 'Belgrano',
    disponibleHoy: false,
    dias: ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    horario: '9:00 a 18:00',
    anosExperiencia: 14,
    trabajosRealizados: 355,
    respuesta: 'Responde en 45 min',
    descripcion:
      'Pintora y decoradora especializada en interiores. Efectos decorativos, empapelados y asesoramiento de color para que tu casa se sienta como vos querés.',
    costoVisita: 4500,
    servicios: [
      { id: 'cr-1', nombre: 'Pintura de interiores', detalle: 'Látex premium, 2 manos', precio: 60000, unidad: 'por ambiente' },
      { id: 'cr-2', nombre: 'Empapelado', detalle: 'Colocación de papel vinílico o tela', precio: 7500, unidad: 'por m²' },
      { id: 'cr-3', nombre: 'Asesoramiento de color', detalle: 'Propuesta de paleta para tu hogar', precio: 12000, unidad: 'por visita' },
    ],
    resenas: [
      { autor: 'Valeria T.', puntaje: 5, fecha: 'Hace 1 semana', texto: 'Me asesoró con los colores y el resultado fue increíble.' },
      { autor: 'Diego F.', puntaje: 5, fecha: 'Hace 1 mes', texto: 'Súper detallista y cuidadosa con todo. Volvería a contratarla.' },
    ],
  },
  {
    id: 'diego-sosa',
    nombre: 'Diego Sosa',
    categoria: 'electricidad',
    oficio: 'Electricista',
    foto: '/profesionales/diego-sosa.webp',
    puntaje: 4.6,
    cantidadResenas: 88,
    distanciaKm: 2.9,
    barrio: 'Caballito',
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    horario: '8:00 a 22:00',
    anosExperiencia: 25,
    trabajosRealizados: 1200,
    respuesta: 'Responde en 20 min',
    descripcion:
      'Electricista con 25 años de experiencia en instalaciones domiciliarias y urgencias las 24 horas. Cambio de cableado, puesta a tierra y mantenimiento general.',
    costoVisita: 4500,
    servicios: [
      { id: 'ds-1', nombre: 'Urgencia eléctrica', detalle: 'Cortes de luz y cortocircuitos', precio: 17000, unidad: 'por visita' },
      { id: 'ds-2', nombre: 'Puesta a tierra', detalle: 'Instalación de jabalina y medición', precio: 48000, unidad: 'por trabajo' },
      { id: 'ds-3', nombre: 'Cambio de cableado', detalle: 'Por ambiente, con cañería', precio: 85000, unidad: 'por ambiente' },
    ],
    resenas: [
      { autor: 'Rubén A.', puntaje: 5, fecha: 'Hace 4 días', texto: 'Vino a las 22 hs por un apagón en casa. Lo resolvió en media hora.' },
      { autor: 'Silvia H.', puntaje: 4, fecha: 'Hace 1 mes', texto: 'Muy buen profesional, sabe mucho. Precio razonable.' },
    ],
  },
  {
    id: 'romina-benitez',
    nombre: 'Romina Benítez',
    categoria: 'plomeria',
    oficio: 'Plomera',
    foto: '/profesionales/romina-benitez.webp',
    puntaje: 4.9,
    cantidadResenas: 71,
    distanciaKm: 3.6,
    barrio: 'Recoleta',
    disponibleHoy: false,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    horario: '8:00 a 17:00',
    anosExperiencia: 7,
    trabajosRealizados: 240,
    respuesta: 'Responde en 25 min',
    descripcion:
      'Plomera con foco en baños y cocinas. Instalación de sanitarios, cambio de cañerías y reparaciones de pérdidas ocultas con detector de humedad.',
    costoVisita: 5000,
    servicios: [
      { id: 'rb-1', nombre: 'Instalación de sanitarios', detalle: 'Inodoro, bidet y lavatorio', precio: 26000, unidad: 'por artefacto' },
      { id: 'rb-2', nombre: 'Detección de pérdidas ocultas', detalle: 'Con equipo especializado', precio: 24000, unidad: 'por visita' },
      { id: 'rb-3', nombre: 'Cambio de cañerías', detalle: 'Termofusión', precio: 70000, unidad: 'desde' },
    ],
    resenas: [
      { autor: 'Camila O.', puntaje: 5, fecha: 'Hace 2 semanas', texto: 'Encontró una pérdida que nadie veía. Muy profesional y explicó todo con claridad.' },
    ],
  },
  {
    id: 'gabriel-molina',
    nombre: 'Gabriel Molina',
    categoria: 'carpinteria',
    oficio: 'Carpintero',
    foto: '/profesionales/gabriel-molina.webp',
    puntaje: 4.7,
    cantidadResenas: 64,
    distanciaKm: 4.2,
    barrio: 'Villa Urquiza',
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    horario: '9:00 a 18:00',
    anosExperiencia: 8,
    trabajosRealizados: 190,
    respuesta: 'Responde en 1 h',
    descripcion:
      'Carpintero especializado en muebles de cocina, deck y pérgolas. Trabajo con madera maciza y MDF de primera calidad, con garantía por escrito.',
    costoVisita: 5000,
    servicios: [
      { id: 'gm-1', nombre: 'Mueble de cocina', detalle: 'Bajo mesada y alacenas a medida', precio: 180000, unidad: 'desde' },
      { id: 'gm-2', nombre: 'Deck de madera', detalle: 'Colocación con tratamiento', precio: 28000, unidad: 'por m²' },
      { id: 'gm-3', nombre: 'Pérgola', detalle: 'Diseño y construcción', precio: 210000, unidad: 'desde' },
    ],
    resenas: [
      { autor: 'Hernán K.', puntaje: 5, fecha: 'Hace 3 semanas', texto: 'El deck quedó hermoso. Muy responsable y cumplió con la fecha.' },
      { autor: 'Julieta N.', puntaje: 4, fecha: 'Hace 2 meses', texto: 'Buen laburo en la cocina. Recomendable.' },
    ],
  },
]
