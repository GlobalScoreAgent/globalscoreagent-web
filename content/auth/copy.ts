import type { Bilingual } from '@/content/marketing/i18n';

export const authCopy = {
  seo: {
    title: {
      es: 'Acceder al Dashboard | Global Score Agent',
      en: 'Access Dashboard | Global Score Agent',
    } satisfies Bilingual,
    description: {
      es: 'Inicia sesión o crea tu cuenta para acceder al dashboard y explorar índices HUMI y WAMI.',
      en: 'Sign in or create your account to access the dashboard and explore HUMI and WAMI indices.',
    } satisfies Bilingual,
  },
  brand: {
    title: { es: 'Global Score Agent', en: 'Global Score Agent' } satisfies Bilingual,
    subtitle: {
      es: 'Reputación y confianza para agentes ERC-8004',
      en: 'Reputation and trust for ERC-8004 agents',
    } satisfies Bilingual,
  },
  tabs: {
    login: { es: 'Iniciar sesión', en: 'Sign in' } satisfies Bilingual,
    register: { es: 'Registrarse', en: 'Sign up' } satisfies Bilingual,
  },
  login: {
    title: { es: 'Bienvenido de nuevo', en: 'Welcome back' } satisfies Bilingual,
    subtitle: {
      es: 'Accede a tu panel de control',
      en: 'Access your control panel',
    } satisfies Bilingual,
    emailLabel: { es: 'Correo electrónico', en: 'Email' } satisfies Bilingual,
    emailPlaceholder: { es: 'tu@email.com', en: 'you@email.com' } satisfies Bilingual,
    passwordLabel: { es: 'Contraseña', en: 'Password' } satisfies Bilingual,
    passwordPlaceholder: { es: '••••••••', en: '••••••••' } satisfies Bilingual,
    submit: { es: 'Iniciar sesión', en: 'Sign in' } satisfies Bilingual,
    submitting: { es: 'Iniciando sesión…', en: 'Signing in…' } satisfies Bilingual,
    noAccount: { es: '¿No tienes cuenta?', en: "Don't have an account?" } satisfies Bilingual,
    switchToRegister: { es: 'Regístrate', en: 'Sign up' } satisfies Bilingual,
  },
  register: {
    title: { es: 'Crear cuenta', en: 'Create account' } satisfies Bilingual,
    subtitle: {
      es: 'Únete para explorar el ecosistema ERC-8004',
      en: 'Join to explore the ERC-8004 ecosystem',
    } satisfies Bilingual,
    emailLabel: { es: 'Correo electrónico', en: 'Email' } satisfies Bilingual,
    emailPlaceholder: { es: 'tu@email.com', en: 'you@email.com' } satisfies Bilingual,
    passwordLabel: { es: 'Contraseña', en: 'Password' } satisfies Bilingual,
    passwordPlaceholder: { es: 'Mínimo 6 caracteres', en: 'At least 6 characters' } satisfies Bilingual,
    confirmPasswordLabel: { es: 'Confirmar contraseña', en: 'Confirm password' } satisfies Bilingual,
    confirmPasswordPlaceholder: { es: 'Repite tu contraseña', en: 'Repeat your password' } satisfies Bilingual,
    promoLabel: { es: 'Código promocional (opcional)', en: 'Promotional code (optional)' } satisfies Bilingual,
    promoPlaceholder: { es: 'Ej. GSA2026', en: 'e.g. GSA2026' } satisfies Bilingual,
    promoHint: {
      es: 'Si tienes un código, ingrésalo ahora. La validación se aplicará próximamente.',
      en: 'If you have a code, enter it now. Validation will be applied in a future step.',
    } satisfies Bilingual,
    submit: { es: 'Crear cuenta', en: 'Create account' } satisfies Bilingual,
    submitting: { es: 'Creando cuenta…', en: 'Creating account…' } satisfies Bilingual,
    hasAccount: { es: '¿Ya tienes cuenta?', en: 'Already have an account?' } satisfies Bilingual,
    switchToLogin: { es: 'Inicia sesión', en: 'Sign in' } satisfies Bilingual,
    confirmEmailTitle: {
      es: 'Revisa tu correo',
      en: 'Check your email',
    } satisfies Bilingual,
    confirmEmailBody: {
      es: 'Te enviamos un enlace para confirmar tu cuenta. Luego podrás iniciar sesión.',
      en: 'We sent you a link to confirm your account. You can sign in afterward.',
    } satisfies Bilingual,
  },
  oauth: {
    divider: { es: 'o continúa con', en: 'or continue with' } satisfies Bilingual,
    google: { es: 'Continuar con Google', en: 'Continue with Google' } satisfies Bilingual,
    github: { es: 'Continuar con GitHub', en: 'Continue with GitHub' } satisfies Bilingual,
    promoNote: {
      es: 'El código promocional solo aplica al registro con correo y contraseña.',
      en: 'Promotional codes only apply to email and password sign-up.',
    } satisfies Bilingual,
  },
  errors: {
    generic: {
      es: 'Ocurrió un error. Inténtalo de nuevo.',
      en: 'Something went wrong. Please try again.',
    } satisfies Bilingual,
    invalidCredentials: {
      es: 'Correo o contraseña incorrectos.',
      en: 'Incorrect email or password.',
    } satisfies Bilingual,
    emailInUse: {
      es: 'Este correo ya está registrado.',
      en: 'This email is already registered.',
    } satisfies Bilingual,
    weakPassword: {
      es: 'La contraseña debe tener al menos 6 caracteres.',
      en: 'Password must be at least 6 characters.',
    } satisfies Bilingual,
    passwordMismatch: {
      es: 'Las contraseñas no coinciden.',
      en: 'Passwords do not match.',
    } satisfies Bilingual,
    oauthFailed: {
      es: 'No se pudo iniciar sesión con el proveedor seleccionado.',
      en: 'Could not sign in with the selected provider.',
    } satisfies Bilingual,
  },
  backHome: { es: 'Volver al inicio', en: 'Back to home' } satisfies Bilingual,
} as const;
