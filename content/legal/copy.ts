import type { Bilingual } from '@/content/marketing/i18n';

export type LegalSection = {
  heading: Bilingual;
  body: Bilingual;
};

export type LegalDocument = {
  title: Bilingual;
  updated: Bilingual;
  sections: LegalSection[];
};

export const legalCopy = {
  seo: {
    title: { es: 'Legal', en: 'Legal' } satisfies Bilingual,
    description: {
      es: 'Términos, privacidad y reembolsos de Global Score Agent — índices HUMI y WAMI para ERC-8004.',
      en: 'Terms, privacy, and refunds for Global Score Agent — HUMI and WAMI indices for ERC-8004.',
    } satisfies Bilingual,
  },
  terms: {
    title: {
      es: 'Términos y Condiciones de Servicio',
      en: 'Terms and Conditions of Service',
    } satisfies Bilingual,
    updated: {
      es: 'Última actualización: 29 de abril de 2026',
      en: 'Last updated: April 29, 2026',
    } satisfies Bilingual,
    sections: [
      {
        heading: { es: '1. Aceptación de los Términos', en: '1. Acceptance of the Terms' } satisfies Bilingual,
        body: {
          es: 'Al acceder y utilizar el sitio web, los índices HUMI y WAMI, el Dashboard y cualquier servicio relacionado de Global Score Agent, usted acepta estos Términos y Condiciones. Si no está de acuerdo, no debe utilizar nuestros servicios.',
          en: 'By accessing and using the website, the HUMI and WAMI indices, the Dashboard, and any related services of Global Score Agent, you agree to these Terms and Conditions. If you do not agree, you must not use our services.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '2. Descripción del Servicio', en: '2. Service Description' } satisfies Bilingual,
        body: {
          es: 'Global Score Agent proporciona índices de confianza (HUMI para agentes y WAMI para wallets) y herramientas de análisis para el estándar ERC-8004, incluyendo búsqueda, evaluación detallada y acceso vía API.',
          en: 'Global Score Agent provides trust indices (HUMI for agents and WAMI for wallets) and analysis tools for the ERC-8004 standard, including search, detailed evaluation, and API access.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '3. Uso de la API y Límites', en: '3. API Usage and Limits' } satisfies Bilingual,
        body: {
          es: 'El uso de la API está sujeto a límites de tasa (rate limits) según el plan contratado. El abuso o uso excesivo puede resultar en la suspensión temporal o permanente de la clave API.',
          en: 'API usage is subject to rate limits according to the contracted plan. Abuse or excessive use may result in temporary or permanent suspension of the API key.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '4. Propiedad Intelectual', en: '4. Intellectual Property' } satisfies Bilingual,
        body: {
          es: 'Todo el contenido, diseño, logos y algoritmos de Global Score Agent son propiedad exclusiva de Global Score Agent. No está permitido copiar, modificar ni distribuir nuestro contenido sin autorización.',
          en: 'All content, design, logos, and algorithms of Global Score Agent are the exclusive property of Global Score Agent. Copying, modifying, or distributing our content without authorization is not permitted.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '5. Limitación de Responsabilidad', en: '5. Limitation of Liability' } satisfies Bilingual,
        body: {
          es: 'Los servicios se proporcionan "tal cual". Global Score Agent no garantiza la exactitud, integridad o disponibilidad continua de los datos. No seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso de nuestros servicios.',
          en: 'The services are provided "as is". Global Score Agent does not guarantee the accuracy, completeness, or continuous availability of the data. We will not be liable for indirect, incidental, or consequential damages arising from the use of our services.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '6. Terminación', en: '6. Termination' } satisfies Bilingual,
        body: {
          es: 'Podemos suspender o terminar su acceso a los servicios en cualquier momento por violación de estos términos o por cualquier otro motivo.',
          en: 'We may suspend or terminate your access to the services at any time for violation of these terms or for any other reason.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '7. Ley Aplicable', en: '7. Governing Law' } satisfies Bilingual,
        body: {
          es: 'Estos términos se rigen por las leyes de Uruguay. Cualquier disputa se resolverá en los tribunales de Montevideo.',
          en: 'These terms are governed by the laws of Uruguay. Any dispute shall be resolved in the courts of Montevideo.',
        } satisfies Bilingual,
      },
    ] as LegalSection[],
  },
  privacy: {
    title: { es: 'Política de Privacidad', en: 'Privacy Policy' } satisfies Bilingual,
    updated: {
      es: 'Última actualización: 29 de abril de 2026',
      en: 'Last updated: April 29, 2026',
    } satisfies Bilingual,
    sections: [
      {
        heading: { es: '1. Información que recolectamos', en: '1. Information We Collect' } satisfies Bilingual,
        body: {
          es: 'Recolectamos correo electrónico cuando crea una cuenta. También podemos recolectar información técnica (IP, navegador) para mejorar el servicio.',
          en: 'We collect email address when you create an account. We may also collect technical information (IP, browser) to improve the service.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '2. Cómo usamos su información', en: '2. How We Use Your Information' } satisfies Bilingual,
        body: {
          es: 'Utilizamos su correo para enviarle actualizaciones sobre los índices HUMI y WAMI, el Dashboard y las certificaciones. No vendemos ni compartimos su información personal con terceros con fines de marketing.',
          en: 'We use your email to send you updates about the HUMI and WAMI indices, the Dashboard, and certifications. We do not sell or share your personal information with third parties for marketing purposes.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '3. Almacenamiento y seguridad', en: '3. Storage and Security' } satisfies Bilingual,
        body: {
          es: 'Sus datos se almacenan en Supabase con medidas de seguridad estándar. Hacemos nuestro mejor esfuerzo para proteger su información, aunque ningún sistema es 100% seguro.',
          en: 'Your data is stored in Supabase with standard security measures. We make our best effort to protect your information, although no system is 100% secure.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '4. Sus derechos', en: '4. Your Rights' } satisfies Bilingual,
        body: {
          es: 'Puede solicitar el acceso, corrección o eliminación de sus datos personales enviando un correo a hello@globalscoreagent.com.',
          en: 'You may request access, correction, or deletion of your personal data by sending an email to hello@globalscoreagent.com.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '5. Cookies', en: '5. Cookies' } satisfies Bilingual,
        body: {
          es: 'Utilizamos cookies técnicas para el correcto funcionamiento del sitio. No utilizamos cookies publicitarias.',
          en: 'We use technical cookies for the proper functioning of the site. We do not use advertising cookies.',
        } satisfies Bilingual,
      },
    ] as LegalSection[],
  },
  refunds: {
    title: { es: 'Política de Reembolsos', en: 'Refund Policy' } satisfies Bilingual,
    updated: {
      es: 'Última actualización: 29 de abril de 2026',
      en: 'Last updated: April 29, 2026',
    } satisfies Bilingual,
    sections: [
      {
        heading: { es: '1. Naturaleza de los servicios', en: '1. Nature of the Services' } satisfies Bilingual,
        body: {
          es: 'Los servicios de Global Score Agent (índices HUMI y WAMI, Dashboard y acceso a API) son productos digitales. Una vez que se proporciona acceso a la cuenta o se consumen recursos de la API, los pagos no son reembolsables.',
          en: 'Global Score Agent services (HUMI and WAMI indices, Dashboard, and API access) are digital products. Once account access is provided or API resources are consumed, payments are non-refundable.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '2. Período de garantía', en: '2. Guarantee Period' } satisfies Bilingual,
        body: {
          es: 'Ofrecemos un período de 14 días desde la activación de cualquier plan de pago para solicitar reembolso completo, siempre que no se haya consumido más del 10% de los créditos o llamadas contratadas.',
          en: 'We offer a 14-day period from the activation of any paid plan to request a full refund, provided that no more than 10% of the contracted credits or calls have been consumed.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '3. Casos sin derecho a reembolso', en: '3. Non-Refundable Cases' } satisfies Bilingual,
        body: {
          es: 'No se otorgarán reembolsos una vez que se haya consumido más del 10% de los créditos, o en casos de violación de los Términos y Condiciones.',
          en: 'Refunds will not be granted once more than 10% of the credits have been consumed, or in cases of violation of the Terms and Conditions.',
        } satisfies Bilingual,
      },
      {
        heading: {
          es: '4. Procedimiento para solicitar reembolso',
          en: '4. How to Request a Refund',
        } satisfies Bilingual,
        body: {
          es: 'Para solicitar un reembolso, envíe un correo electrónico a hello@globalscoreagent.com dentro de los 14 días posteriores a la compra, indicando claramente el motivo. Las solicitudes serán revisadas en un plazo máximo de 7 días hábiles.',
          en: 'To request a refund, please email hello@globalscoreagent.com within 14 days of purchase, clearly stating the reason. Requests will be reviewed within a maximum of 7 business days.',
        } satisfies Bilingual,
      },
      {
        heading: { es: '5. Reembolsos procesados', en: '5. Processed Refunds' } satisfies Bilingual,
        body: {
          es: 'Los reembolsos aprobados se procesarán a través del mismo método de pago utilizado en un plazo máximo de 10 días hábiles.',
          en: 'Approved refunds will be processed through the same payment method used within a maximum of 10 business days.',
        } satisfies Bilingual,
      },
    ] as LegalSection[],
  },
} as const;
