import type { Bilingual } from '@/content/marketing/i18n';

export const waitlistCopy = {
  seo: {
    title: { es: 'Lista de espera', en: 'Waitlist' } satisfies Bilingual,
    description: {
      es: 'Únete a la lista de espera de Global Score Agent para acceso anticipado al Dashboard y la API de los índices HUMI y WAMI.',
      en: 'Join the Global Score Agent waitlist for early access to the Dashboard and API for the HUMI and WAMI indices.',
    } satisfies Bilingual,
  },
  title: { es: 'Únete a la Lista de Espera', en: 'Join the Waitlist' } satisfies Bilingual,
  subtitle: {
    es: 'Sé de los primeros en acceder al Dashboard y la API completa de los índices HUMI y WAMI.',
    en: 'Be among the first to access the full Dashboard and API for the HUMI and WAMI indices.',
  } satisfies Bilingual,
  form: {
    emailLabel: { es: 'Tu correo electrónico', en: 'Your email address' } satisfies Bilingual,
    emailPlaceholder: { es: 'tu@email.com', en: 'your@email.com' } satisfies Bilingual,
    submit: { es: 'Unirme a la lista de espera', en: 'Join the waitlist' } satisfies Bilingual,
    submitting: { es: 'Enviando...', en: 'Sending...' } satisfies Bilingual,
  },
  success: {
    title: { es: '¡Gracias!', en: 'Thank you!' } satisfies Bilingual,
    message: {
      es: 'Te mantendremos informado.',
      en: 'We will keep you updated.',
    } satisfies Bilingual,
    alreadyRegistered: {
      es: 'Este email ya estaba registrado.',
      en: 'This email was already registered.',
    } satisfies Bilingual,
    backHome: { es: 'Volver al inicio', en: 'Back to home' } satisfies Bilingual,
  },
  footerNote: {
    es: 'Te avisaremos tan pronto como el Dashboard y la API estén disponibles.',
    en: 'We will notify you as soon as the Dashboard and API are ready.',
  } satisfies Bilingual,
  errors: {
    connection: { es: 'Error de conexión', en: 'Connection error' } satisfies Bilingual,
    generic: { es: 'Algo salió mal', en: 'Something went wrong' } satisfies Bilingual,
    invalidEmail: { es: 'Email inválido', en: 'Invalid email' } satisfies Bilingual,
    submitFailed: {
      es: 'Error al registrar. Inténtalo de nuevo.',
      en: 'Could not register. Please try again.',
    } satisfies Bilingual,
  },
} as const;
