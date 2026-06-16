import type { BilingualText } from '@/lib/gsa/dashboard-plan-catalog';

export type SubscriptionPricingDetailSection = {
  title: BilingualText;
  bodyMarkdown: BilingualText;
};

export const SUBSCRIPTION_PRICING_DETAIL_SECTIONS: SubscriptionPricingDetailSection[] = [
  {
    title: {
      es: 'Vencimiento de Créditos',
      en: 'Credit Expiration Policy',
    },
    bodyMarkdown: {
      es: `- Los créditos obtenidos mediante la **prueba gratuita** o **códigos promocionales** **no tienen fecha de vencimiento**. Quedan asociados al perfil del usuario y pueden utilizarse en cualquier momento.
- Los créditos mensuales incluidos en los planes **Pro** tienen una validez de **30 días** y **no son acumulables**. Si no se utilizan durante el período de facturación, se pierden al finalizar el mes.`,
      en: `- Credits obtained through the **Free Trial** or **promotional codes** **do not expire**. They remain associated with the user profile and can be used at any time.
- Monthly credits included in **Pro** plans have a validity of **30 days** and **are non-accumulative**. Unused credits are lost at the end of the billing period.`,
    },
  },
  {
    title: {
      es: 'Política de Prueba Gratuita',
      en: 'Free Trial Policy',
    },
    bodyMarkdown: {
      es: `Al finalizar los **5 días de prueba gratuita**, las funcionalidades de consulta y análisis del Dashboard quedan **bloqueadas**. Sin embargo, el usuario **sigue teniendo acceso** al Dashboard para poder:

- Suscribirse a un plan de pago, o
- Crear una API Key y utilizar los créditos de API disponibles (en caso de que los tenga).`,
      en: `Once the **5-day free trial** ends, Dashboard query and analysis features become **locked**. However, the user **retains access** to the Dashboard to:

- Subscribe to a paid plan, or
- Create an API Key and use any available API credits (if they have any).`,
    },
  },
  {
    title: {
      es: 'Cambios de Plan, Cancelaciones y Reembolsos',
      en: 'Plan Changes, Cancellations, and Refunds',
    },
    bodyMarkdown: {
      es: `Para realizar cualquiera de las siguientes acciones, el usuario debe enviar un ticket a través de la opción **Comentarios** disponible en el menú del Dashboard:

- Cancelación de suscripción
- Cambio de plan (upgrade o downgrade)
- Solicitud de reembolso

**Nota:** Los reembolsos están sujetos a revisión y solo aplican dentro de los primeros 14 días desde la contratación del plan (excluyendo créditos ya consumidos).`,
      en: `To request any of the following actions, users must submit a ticket through the **Comments** option available in the Dashboard menu:

- Subscription cancellation
- Plan change (upgrade or downgrade)
- Refund request

**Note:** Refunds are subject to review and only apply within the first 14 days after purchasing a plan (excluding already consumed credits).`,
    },
  },
  {
    title: {
      es: 'Métodos de Pago',
      en: 'Payment Methods',
    },
    bodyMarkdown: {
      es: `Actualmente trabajamos con **NOWPayments** como pasarela de pagos principal. Aceptamos pagos mediante **billeteras de criptomonedas** (principalmente USDC y otras stablecoins).

**Flujo de pago de suscripción:**

1. Eliges un plan en el Dashboard.
2. Recibes un **correo de NOWPayments** con el enlace de pago.
3. Completas el pago con tu **billetera de criptomonedas**.
4. Tras confirmarse el pago, tu suscripción se **activa automáticamente**.
5. Las suscripciones se **renuevan** según el ciclo contratado (mensual o anual).

Próximamente incorporaremos también el **pago con tarjetas de crédito y débito**.`,
      en: `We currently use **NOWPayments** as our main payment gateway. We accept payments through **cryptocurrency wallets** (primarily USDC and other stablecoins).

**Subscription payment flow:**

1. Choose a plan in the Dashboard.
2. You receive a **NOWPayments email** with the payment link.
3. Complete the payment with your **cryptocurrency wallet**.
4. Once the payment is confirmed, your subscription is **activated automatically**.
5. Subscriptions **renew** according to your billing cycle (monthly or annual).

We will soon also support payments with **credit and debit cards**.`,
    },
  },
];
