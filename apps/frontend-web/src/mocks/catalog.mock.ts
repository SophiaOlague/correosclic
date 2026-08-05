import type { CategoryDto, ProductDetailDto } from '@/types/catalog';

/**
 * Datos de ejemplo del catálogo.
 *
 * ⚠️ TODO: Backend integration pending — este archivo desaparece en cuanto
 * existan `GET /catalog/products`, `GET /catalog/products/:id` y
 * `GET /catalog/categories`. Solo lo consume `services/api/catalog.api.ts`:
 * ningún componente ni hook debe importarlo.
 *
 * **Los identificadores son reales.** Se volcaron de la base de datos sembrada
 * (`packages/database/prisma/seed/catalog.seed.ts`), de modo que cada
 * `variantes[].id` es un `productoVarianteId` que el backend reconoce. Gracias
 * a eso el carrito funciona de punta a punta contra la API aunque la lectura
 * del catálogo todavía sea local.
 *
 * Los campos opcionales (`precioAnterior`, `calificacion`, `totalOpiniones`,
 * `etiqueta`, `envioGratis`, `unidadesVendidas`) no existen en el esquema de
 * Prisma. Se rellenan **solo en algunos productos** a propósito: así se
 * comprueba que la interfaz degrada correctamente cuando el backend no los
 * provee.
 */

export const MOCK_CATEGORIES: CategoryDto[] = [
  {
    "id": "5b828ecb-525d-40dc-ba96-f46f84882e66",
    "parentId": "c2f4c5a6-0e6e-4782-8f52-837740464516",
    "nombre": "Accesorios",
    "slug": "accesorios-oficina",
    "descripcion": null,
    "productCount": 0
  },
  {
    "id": "97f8191b-4275-4d4a-8be8-adf6d13b81eb",
    "parentId": "e5508c1f-8838-441c-a7c9-750bd82305f6",
    "nombre": "Audio",
    "slug": "audio",
    "descripcion": null,
    "productCount": 1
  },
  {
    "id": "e5508c1f-8838-441c-a7c9-750bd82305f6",
    "parentId": null,
    "nombre": "Electrónica",
    "slug": "electronica",
    "descripcion": "Productos electrónicos.",
    "productCount": 4
  },
  {
    "id": "4a52e50a-0d79-4515-be14-d8237cfe6ee4",
    "parentId": null,
    "nombre": "Hogar",
    "slug": "hogar",
    "descripcion": "Artículos para el hogar.",
    "productCount": 1
  },
  {
    "id": "70d4ebe4-bab7-4da3-8c44-b995c906d322",
    "parentId": "e5508c1f-8838-441c-a7c9-750bd82305f6",
    "nombre": "Monitores",
    "slug": "monitores",
    "descripcion": null,
    "productCount": 1
  },
  {
    "id": "fd5971e1-b459-4d8c-b084-1af6e542f355",
    "parentId": "e5508c1f-8838-441c-a7c9-750bd82305f6",
    "nombre": "Mouse",
    "slug": "mouse",
    "descripcion": null,
    "productCount": 1
  },
  {
    "id": "c2f4c5a6-0e6e-4782-8f52-837740464516",
    "parentId": null,
    "nombre": "Oficina",
    "slug": "oficina",
    "descripcion": "Papelería y accesorios de oficina.",
    "productCount": 1
  },
  {
    "id": "d6f0a1b0-4bc3-46a4-8cda-ff7af38320bd",
    "parentId": "c2f4c5a6-0e6e-4782-8f52-837740464516",
    "nombre": "Papelería",
    "slug": "papeleria",
    "descripcion": null,
    "productCount": 1
  },
  {
    "id": "f32d9bde-2562-4eb1-887c-e7467240289d",
    "parentId": "25d601c8-fe58-425d-b3ff-cd97a8839ab3",
    "nombre": "Playeras",
    "slug": "playeras",
    "descripcion": null,
    "productCount": 1
  },
  {
    "id": "25d601c8-fe58-425d-b3ff-cd97a8839ab3",
    "parentId": null,
    "nombre": "Ropa",
    "slug": "ropa",
    "descripcion": "Ropa y accesorios.",
    "productCount": 1
  },
  {
    "id": "98973232-b478-4f76-b700-a1de753c30fa",
    "parentId": "e5508c1f-8838-441c-a7c9-750bd82305f6",
    "nombre": "Teclados",
    "slug": "teclados",
    "descripcion": null,
    "productCount": 1
  }
];

export const MOCK_PRODUCTS: ProductDetailDto[] = [
  {
    "id": "eb14c758-a5e2-495c-932d-99b67d354c7f",
    "codigoPublico": "PROD-000001",
    "nombre": "Mouse Logitech G203 Lightsync",
    "categoriaId": "fd5971e1-b459-4d8c-b084-1af6e542f355",
    "tienda": {
      "id": "c3ddef11-994d-4ddb-9f55-61da70c65021",
      "vendedorId": "3243241e-285a-4fdc-a633-905d2a7f987a",
      "codigoPublico": "TECH-DGO",
      "nombre": "TechStore Durango",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/logitech-g203.jpg",
    "precioDesde": 499,
    "stockTotal": 100,
    "precioAnterior": 649,
    "calificacion": 4.7,
    "totalOpiniones": 812,
    "etiqueta": "-23%",
    "envioGratis": true,
    "unidadesVendidas": 1240,
    "descripcion": "Mouse gamer Logitech G203 Lightsync con sensor de alta precisión y retroiluminación RGB.",
    "pesoKg": 0.085,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "fd5971e1-b459-4d8c-b084-1af6e542f355",
      "nombre": "Mouse",
      "slug": "mouse"
    },
    "imagenes": [
      {
        "id": "949b4ec5-780b-45ef-badb-beea49fe4c05",
        "url": "https://cdn.correosclic.dev/products/logitech-g203.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "0105c1cf-67cb-4702-9b30-987b581eb416",
        "sku": "LOG-G203-BLK",
        "precio": 499,
        "pesoKg": 0.085,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          }
        ]
      },
      {
        "id": "69472b46-662f-41a5-ac57-ba4615745972",
        "sku": "LOG-G203-WHT",
        "precio": 499,
        "pesoKg": 0.085,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Blanco"
          }
        ]
      }
    ]
  },
  {
    "id": "b8eded6c-8f4e-4107-9119-58ddd34a8de4",
    "codigoPublico": "PROD-000002",
    "nombre": "Teclado Mecánico Redragon Kumara K552",
    "categoriaId": "98973232-b478-4f76-b700-a1de753c30fa",
    "tienda": {
      "id": "c3ddef11-994d-4ddb-9f55-61da70c65021",
      "vendedorId": "3243241e-285a-4fdc-a633-905d2a7f987a",
      "codigoPublico": "TECH-DGO",
      "nombre": "TechStore Durango",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/redragon-k552.jpg",
    "precioDesde": 899,
    "stockTotal": 100,
    "descripcion": "Teclado mecánico compacto con switches Outemu y retroiluminación LED.",
    "pesoKg": 0.86,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "98973232-b478-4f76-b700-a1de753c30fa",
      "nombre": "Teclados",
      "slug": "teclados"
    },
    "imagenes": [
      {
        "id": "a9cbd4e1-1e7b-4eb3-8255-835ec8526321",
        "url": "https://cdn.correosclic.dev/products/redragon-k552.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "ac437e13-b3e9-4784-8198-c93ff9e6f752",
        "sku": "RED-K552-BLK",
        "precio": 899,
        "pesoKg": 0.86,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          }
        ]
      },
      {
        "id": "4483069f-91fd-4fb2-b67c-2cf55bf34f00",
        "sku": "RED-K552-WHT",
        "precio": 899,
        "pesoKg": 0.86,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Blanco"
          }
        ]
      }
    ]
  },
  {
    "id": "ba443ea0-aecb-4b34-9f93-f4e761ede151",
    "codigoPublico": "PROD-000003",
    "nombre": "HyperX Cloud Stinger",
    "categoriaId": "97f8191b-4275-4d4a-8be8-adf6d13b81eb",
    "tienda": {
      "id": "c3ddef11-994d-4ddb-9f55-61da70c65021",
      "vendedorId": "3243241e-285a-4fdc-a633-905d2a7f987a",
      "codigoPublico": "TECH-DGO",
      "nombre": "TechStore Durango",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/hyperx-cloud-stinger.jpg",
    "precioDesde": 1099,
    "stockTotal": 100,
    "calificacion": 4.6,
    "totalOpiniones": 431,
    "etiqueta": "Mas vendido",
    "envioGratis": true,
    "unidadesVendidas": 980,
    "descripcion": "Audífonos gamer HyperX Cloud Stinger con micrófono abatible.",
    "pesoKg": 0.32,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "97f8191b-4275-4d4a-8be8-adf6d13b81eb",
      "nombre": "Audio",
      "slug": "audio"
    },
    "imagenes": [
      {
        "id": "ab13c334-14fa-450f-995e-926548e05c3c",
        "url": "https://cdn.correosclic.dev/products/hyperx-cloud-stinger.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "5dd6457d-5ac9-4f3c-9904-1d43d5079551",
        "sku": "HYP-STINGER-BLK",
        "precio": 1099,
        "pesoKg": 0.32,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          }
        ]
      },
      {
        "id": "96f210fa-ac96-44c7-80e2-6069aaea4938",
        "sku": "HYP-STINGER-RED",
        "precio": 1099,
        "pesoKg": 0.32,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Rojo"
          }
        ]
      }
    ]
  },
  {
    "id": "829b4116-b2f5-4589-8575-bafcb7e59b99",
    "codigoPublico": "PROD-000004",
    "nombre": "Playera Oficial CorreosClic",
    "categoriaId": "f32d9bde-2562-4eb1-887c-e7467240289d",
    "tienda": {
      "id": "c3ddef11-994d-4ddb-9f55-61da70c65021",
      "vendedorId": "3243241e-285a-4fdc-a633-905d2a7f987a",
      "codigoPublico": "TECH-DGO",
      "nombre": "TechStore Durango",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/playera-correosclic.jpg",
    "precioDesde": 299,
    "stockTotal": 300,
    "descripcion": "Playera oficial de algodón con logotipo de CorreosClic.",
    "pesoKg": 0.18,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "f32d9bde-2562-4eb1-887c-e7467240289d",
      "nombre": "Playeras",
      "slug": "playeras"
    },
    "imagenes": [
      {
        "id": "c6ba12c7-b413-4e50-aef0-3690cccb7434",
        "url": "https://cdn.correosclic.dev/products/playera-correosclic.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "02795269-a863-4e00-9843-ccbbabcdf649",
        "sku": "CC-TEE-BLK-S",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          },
          {
            "atributo": "Tamaño",
            "valor": "S"
          }
        ]
      },
      {
        "id": "42da7fd1-b4ba-4e44-a2d9-87892e92642e",
        "sku": "CC-TEE-BLK-M",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          },
          {
            "atributo": "Tamaño",
            "valor": "M"
          }
        ]
      },
      {
        "id": "57703869-7213-4ddd-b674-8e552b5e2944",
        "sku": "CC-TEE-BLK-L",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          },
          {
            "atributo": "Tamaño",
            "valor": "L"
          }
        ]
      },
      {
        "id": "f8fcf7ac-7d10-41c6-b643-86de11093765",
        "sku": "CC-TEE-WHT-S",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Blanco"
          },
          {
            "atributo": "Tamaño",
            "valor": "S"
          }
        ]
      },
      {
        "id": "54a92451-9ca9-490a-abca-15fcef5b2b6d",
        "sku": "CC-TEE-WHT-M",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Blanco"
          },
          {
            "atributo": "Tamaño",
            "valor": "M"
          }
        ]
      },
      {
        "id": "322f3e9b-0fb1-41e7-9484-dd7a81f9fedd",
        "sku": "CC-TEE-WHT-L",
        "precio": 299,
        "pesoKg": 0.18,
        "activa": true,
        "stockDisponible": 50,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Blanco"
          },
          {
            "atributo": "Tamaño",
            "valor": "L"
          }
        ]
      }
    ]
  },
  {
    "id": "ecb0ae15-fc8f-40b8-ae4d-5fdc5bda6a1d",
    "codigoPublico": "PROD-000005",
    "nombre": "Libreta Profesional A5",
    "categoriaId": "d6f0a1b0-4bc3-46a4-8cda-ff7af38320bd",
    "tienda": {
      "id": "c3ddef11-994d-4ddb-9f55-61da70c65021",
      "vendedorId": "3243241e-285a-4fdc-a633-905d2a7f987a",
      "codigoPublico": "TECH-DGO",
      "nombre": "TechStore Durango",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/libreta-profesional.jpg",
    "precioDesde": 149,
    "stockTotal": 50,
    "descripcion": "Libreta profesional de pasta dura con 100 hojas.",
    "pesoKg": 0.41,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "d6f0a1b0-4bc3-46a4-8cda-ff7af38320bd",
      "nombre": "Papelería",
      "slug": "papeleria"
    },
    "imagenes": [
      {
        "id": "970e4c13-87d9-4ddd-a2b2-9c32a61d4351",
        "url": "https://cdn.correosclic.dev/products/libreta-profesional.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "ab93425d-0f85-4299-b16d-71c34f407c00",
        "sku": "NOTEBOOK-A5",
        "precio": 149,
        "pesoKg": 0.41,
        "activa": true,
        "stockDisponible": 50,
        "atributos": []
      }
    ]
  },
  {
    "id": "e3e2163b-530a-4226-af1d-61de7749e3df",
    "codigoPublico": "PROD-000006",
    "nombre": "Monitor LG 24\" Full HD",
    "categoriaId": "70d4ebe4-bab7-4da3-8c44-b995c906d322",
    "tienda": {
      "id": "730be171-ddfe-405e-84d8-a1f9a1f312ea",
      "vendedorId": "2ff08f7e-e553-48a4-a567-57e6989230db",
      "codigoPublico": "ELEC-JAL",
      "nombre": "Jalisco Electronics",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/lg-monitor-24.jpg",
    "precioDesde": 3499,
    "stockTotal": 20,
    "precioAnterior": 3899,
    "etiqueta": "-15%",
    "unidadesVendidas": 210,
    "descripcion": "Monitor LG de 24 pulgadas, panel IPS, Full HD.",
    "pesoKg": 3.5,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "70d4ebe4-bab7-4da3-8c44-b995c906d322",
      "nombre": "Monitores",
      "slug": "monitores"
    },
    "imagenes": [
      {
        "id": "38bd62ac-bce3-4f5d-ba0a-6f8fe7c2b3de",
        "url": "https://cdn.correosclic.dev/products/lg-monitor-24.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "737d180c-0c1a-4e32-9eae-49e641d4b5ee",
        "sku": "LG-MON24-BLK",
        "precio": 3499,
        "pesoKg": 3.5,
        "activa": true,
        "stockDisponible": 20,
        "atributos": [
          {
            "atributo": "Color",
            "valor": "Negro"
          }
        ]
      }
    ]
  },
  {
    "id": "6a50bdee-e80b-4970-a437-00970ce8f6fb",
    "codigoPublico": "PROD-000007",
    "nombre": "Hamaca Artesanal Yucateca",
    "categoriaId": "4a52e50a-0d79-4515-be14-d8237cfe6ee4",
    "tienda": {
      "id": "d4bee8ea-55c3-4b85-ad3e-e0ce910cf2e4",
      "vendedorId": "72e8a4e3-5618-40d2-b38f-359ac430afd0",
      "codigoPublico": "HOGAR-ROO",
      "nombre": "Caribbean Crafts",
      "logoUrl": null
    },
    "imagenPrincipalUrl": "https://cdn.correosclic.dev/products/hamaca-artesanal.jpg",
    "precioDesde": 899,
    "stockTotal": 20,
    "descripcion": "Hamaca tejida a mano, tamaño matrimonial.",
    "pesoKg": 1.2,
    "altoCm": null,
    "anchoCm": null,
    "largoCm": null,
    "categoria": {
      "id": "4a52e50a-0d79-4515-be14-d8237cfe6ee4",
      "nombre": "Hogar",
      "slug": "hogar"
    },
    "imagenes": [
      {
        "id": "18c59c0d-ff39-4b3c-8496-08efe5ce17dc",
        "url": "https://cdn.correosclic.dev/products/hamaca-artesanal.jpg",
        "orden": 1,
        "esPrincipal": true
      }
    ],
    "variantes": [
      {
        "id": "8e3aa482-157e-4d6f-9afe-379d94093de3",
        "sku": "HAM-YUC-XL",
        "precio": 899,
        "pesoKg": 1.2,
        "activa": true,
        "stockDisponible": 20,
        "atributos": []
      }
    ]
  }
];

/** Fecha de alta real de cada producto, para el criterio "Más recientes". */
export const MOCK_PRODUCT_CREATED_AT = new Map<string, string>([
  [
    "eb14c758-a5e2-495c-932d-99b67d354c7f",
    "2026-07-24T21:42:36.666Z"
  ],
  [
    "b8eded6c-8f4e-4107-9119-58ddd34a8de4",
    "2026-07-24T21:42:36.676Z"
  ],
  [
    "ba443ea0-aecb-4b34-9f93-f4e761ede151",
    "2026-07-24T21:42:36.679Z"
  ],
  [
    "829b4116-b2f5-4589-8575-bafcb7e59b99",
    "2026-07-24T21:42:36.681Z"
  ],
  [
    "ecb0ae15-fc8f-40b8-ae4d-5fdc5bda6a1d",
    "2026-07-24T21:42:36.683Z"
  ],
  [
    "e3e2163b-530a-4226-af1d-61de7749e3df",
    "2026-07-27T22:30:16.492Z"
  ],
  [
    "6a50bdee-e80b-4970-a437-00970ce8f6fb",
    "2026-07-27T22:30:16.507Z"
  ]
]);

/**
 * Opiniones de ejemplo del detalle de producto.
 * TODO: Backend integration pending — no existe modelo de reseñas en Prisma.
 */
export const MOCK_REVIEWS = [
  {
    id: 'r1',
    autor: 'María González',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format',
    calificacion: 5,
    titulo: 'Excelente producto, muy recomendado',
    texto:
      'Increíble experiencia. Llegó en 2 días perfectamente empacado. El rastreo con Correos fue exacto en todo momento. ¡Ya hice mi cuarta compra!',
    fecha: 'Hace 2 semanas',
    compraVerificada: true,
  },
  {
    id: 'r2',
    autor: 'Carlos Ramírez',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    calificacion: 5,
    titulo: 'Cumple con lo prometido',
    texto:
      'Lo que más me convenció fue la protección de compra. Tuve una duda y en menos de 24 horas me respondieron. Servicio de primer nivel.',
    fecha: 'Hace 1 mes',
    compraVerificada: true,
  },
];

/**
 * Preguntas y respuestas de ejemplo del detalle de producto.
 * TODO: Backend integration pending — no existe modelo de preguntas en Prisma.
 */
export const MOCK_QUESTIONS = [
  {
    id: 'q1',
    pregunta: '¿Es original y viene con garantía?',
    respuesta:
      '¡Hola! Sí, es 100% original y viene con su tarjeta de garantía del fabricante. Saludos.',
  },
  {
    id: 'q2',
    pregunta: '¿Cuánto tarda en llegar al CP 64000?',
    respuesta:
      'Hola, a Monterrey te llega de 1 a 2 días hábiles con nuestro envío de CorreosClic.',
  },
];
