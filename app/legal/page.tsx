'use client';
import { useLanguage } from '../contexts/LanguageContext';

export default function LegalPage() {
  const { language } = useLanguage();

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-white pt-20">
        <div className="max-w-4xl mx-auto px-6 py-0">
          <div className="space-y-20">            

            {/* TÉRMINOS Y CONDICIONES */}
            <section>
              <h2 className="text-3xl font-semibold mb-6 border-b border-gold/30 pb-4">
                {language === 'es' ? 'Términos y Condiciones de Servicio' : 'Terms and Conditions of Service'}
              </h2>
              <p className="text-sm text-zinc-500 mb-8">
                {language === 'es' ? 'Última actualización: 29 de abril de 2026' : 'Last updated: April 29, 2026'}
              </p>

              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '1. Aceptación de los Términos' : '1. Acceptance of the Terms'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Al acceder y utilizar el sitio web, el HUMI Index, el Dashboard y cualquier servicio relacionado de Global Score Agent, usted acepta estos Términos y Condiciones. Si no está de acuerdo, no debe utilizar nuestros servicios.' 
                    : 'By accessing and using the website, the HUMI Index, the Dashboard and any related services of Global Score Agent, you agree to these Terms and Conditions. If you do not agree, you must not use our services.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '2. Descripción del Servicio' : '2. Service Description'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Global Score Agent proporciona un índice de confianza (HUMI Index) y herramientas de análisis para agentes autónomos en el estándar ERC-8004, incluyendo búsqueda, evaluación detallada y acceso vía API.' 
                    : 'Global Score Agent provides a trust index (HUMI Index) and analysis tools for autonomous agents in the ERC-8004 standard, including search, detailed evaluation and API access.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '3. Uso de la API y Límites' : '3. API Usage and Limits'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'El uso de la API está sujeto a límites de tasa (rate limits) según el plan contratado. El abuso o uso excesivo puede resultar en la suspensión temporal o permanente de la clave API.' 
                    : 'API usage is subject to rate limits according to the contracted plan. Abuse or excessive use may result in temporary or permanent suspension of the API key.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '4. Propiedad Intelectual' : '4. Intellectual Property'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Todo el contenido, diseño, logos y algoritmos de Global Score Agent son propiedad exclusiva de Global Score Agent. No está permitido copiar, modificar ni distribuir nuestro contenido sin autorización.' 
                    : 'All content, design, logos and algorithms of Global Score Agent are the exclusive property of Global Score Agent. Copying, modifying or distributing our content without authorization is not permitted.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '5. Limitación de Responsabilidad' : '5. Limitation of Liability'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Los servicios se proporcionan "tal cual". Global Score Agent no garantiza la exactitud, integridad o disponibilidad continua de los datos. No seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso de nuestros servicios.' 
                    : 'The services are provided "as is". Global Score Agent does not guarantee the accuracy, completeness or continuous availability of the data. We will not be liable for indirect, incidental or consequential damages arising from the use of our services.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '6. Terminación' : '6. Termination'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Podemos suspender o terminar su acceso a los servicios en cualquier momento por violación de estos términos o por cualquier otro motivo.' 
                    : 'We may suspend or terminate your access to the services at any time for violation of these terms or for any other reason.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '7. Ley Aplicable' : '7. Governing Law'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Estos términos se rigen por las leyes de Uruguay. Cualquier disputa se resolverá en los tribunales de Montevideo.' 
                    : 'These terms are governed by the laws of Uruguay. Any dispute shall be resolved in the courts of Montevideo.'}
                </p>
              </div>
            </section>

            {/* POLÍTICA DE PRIVACIDAD */}
            <section>
              <h2 className="text-3xl font-semibold mb-6 border-b border-gold/30 pb-4">
                {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
              </h2>
              <p className="text-sm text-zinc-500 mb-8">
                {language === 'es' ? 'Última actualización: 29 de abril de 2026' : 'Last updated: April 29, 2026'}
              </p>

              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '1. Información que recolectamos' : '1. Information We Collect'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Recolectamos correo electrónico cuando se registra en la lista de espera o crea una cuenta. También podemos recolectar información técnica (IP, navegador) para mejorar el servicio.' 
                    : 'We collect email address when you register on the waitlist or create an account. We may also collect technical information (IP, browser) to improve the service.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '2. Cómo usamos su información' : '2. How We Use Your Information'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Utilizamos su correo para enviarle actualizaciones sobre el HUMI Index, el Dashboard y las certificaciones. No vendemos ni compartimos su información personal con terceros con fines de marketing.' 
                    : 'We use your email to send you updates about the HUMI Index, the Dashboard and the certifications. We do not sell or share your personal information with third parties for marketing purposes.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '3. Almacenamiento y seguridad' : '3. Storage and Security'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Sus datos se almacenan en Supabase con medidas de seguridad estándar. Hacemos nuestro mejor esfuerzo para proteger su información, aunque ningún sistema es 100% seguro.' 
                    : 'Your data is stored in Supabase with standard security measures. We make our best effort to protect your information, although no system is 100% secure.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '4. Sus derechos' : '4. Your Rights'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Puede solicitar el acceso, corrección o eliminación de sus datos personales enviando un correo a hello@globalscoreagent.com.' 
                    : 'You may request access, correction or deletion of your personal data by sending an email to hello@globalscoreagent.com.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '5. Cookies' : '5. Cookies'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Utilizamos cookies técnicas para el correcto funcionamiento del sitio. No utilizamos cookies publicitarias.' 
                    : 'We use technical cookies for the proper functioning of the site. We do not use advertising cookies.'}
                </p>
              </div>
            </section>

            {/* POLÍTICA DE REEMBOLSOS */}
            <section>
              <h2 className="text-3xl font-semibold mb-6 border-b border-gold/30 pb-4">
                {language === 'es' ? 'Política de Reembolsos' : 'Refund Policy'}
              </h2>
              <p className="text-sm text-zinc-500 mb-8">
                {language === 'es' ? 'Última actualización: 29 de abril de 2026' : 'Last updated: April 29, 2026'}
              </p>

              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '1. Naturaleza de los servicios' : '1. Nature of the Services'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Los servicios de Global Score Agent (HUMI Index, Dashboard y acceso a API) son productos digitales. Una vez que se proporciona acceso a la cuenta o se consumen recursos de la API, los pagos no son reembolsables.' 
                    : 'Global Score Agent services (HUMI Index, Dashboard and API access) are digital products. Once account access is provided or API resources are consumed, payments are non-refundable.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '2. Período de garantía' : '2. Guarantee Period'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Ofrecemos un período de 14 días desde la activación de cualquier plan de pago para solicitar reembolso completo, siempre que no se haya consumido más del 10% de los créditos o llamadas contratadas.' 
                    : 'We offer a 14-day period from the activation of any paid plan to request a full refund, provided that no more than 10% of the contracted credits or calls have been consumed.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '3. Casos sin derecho a reembolso' : '3. Non-Refundable Cases'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'No se otorgarán reembolsos una vez que se haya consumido más del 10% de los créditos, o en casos de violación de los Términos y Condiciones.' 
                    : 'Refunds will not be granted once more than 10% of the credits have been consumed, or in cases of violation of the Terms and Conditions.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '4. Procedimiento para solicitar reembolso' : '4. How to Request a Refund'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Para solicitar un reembolso, envíe un correo electrónico a hello@globalscoreagent.com dentro de los 14 días posteriores a la compra, indicando claramente el motivo. Las solicitudes serán revisadas en un plazo máximo de 7 días hábiles.' 
                    : 'To request a refund, please email hello@globalscoreagent.com within 14 days of purchase, clearly stating the reason. Requests will be reviewed within a maximum of 7 business days.'}
                </p>

                <h3 className="text-xl font-medium mt-8 mb-4">
                  {language === 'es' ? '5. Reembolsos procesados' : '5. Processed Refunds'}
                </h3>
                <p>
                  {language === 'es' 
                    ? 'Los reembolsos aprobados se procesarán a través del mismo método de pago utilizado en un plazo máximo de 10 días hábiles.' 
                    : 'Approved refunds will be processed through the same payment method used within a maximum of 10 business days.'}
                </p>
              </div>
              
              <div className="mt-16 text-center text-xs text-zinc-500">
 
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER - Actualizado con todas las páginas */}
      <footer className="bg-black text-zinc-400 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logo + Texto */}
            <div className="flex items-center gap-0">
              <img src="/logo-gsa.png" alt="GSA" className="w-25 h-20" />
              <div>
                <span className="font-semibold text-white text-2xl">Global Score Agent</span>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {language === 'es' 
                    ? 'Infraestructura de Confianza para Agentes IA' 
                    : 'Trust Infrastructure for AI Agents'}
                </p>
              </div>
            </div>

            {/* Navigation - Todas las páginas */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              <a href="/" className="hover:text-white transition-colors">
                {language === 'es' ? 'Inicio' : 'Home'}
              </a>
              <a href="/about" className="hover:text-white transition-colors">
                {language === 'es' ? 'Quiénes Somos' : 'About Us'}
              </a>
              <a href="/humi" className="hover:text-white transition-colors">
                {language === 'es' ? 'Índice HUMI' : 'HUMI Index'}
              </a>
              <a href="/certificaciones" className="hover:text-white transition-colors">
                {language === 'es' ? 'Productos' : 'Products'}
              </a>
              <a href="/legal" className="hover:text-white transition-colors">
                {language === 'es' ? 'Legal' : 'Legal'}
              </a>
            </div>

            {/* Contacto */}
            <div className="text-right">
              <p className="text-sm mb-2">
                {language === 'es' ? 'Contáctanos' : 'Contact Us'}
              </p>
              <a href="mailto:hello@globalscoreagent.com" className="hover:text-white block">hello@globalscoreagent.com</a>
              <a href="https://x.com/ScoreIAAgent" target="_blank" className="hover:text-white block mt-1">X @ScoreIAAgent</a>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-xs text-zinc-500">
            © 2026 Global Score Agent.{' '}
            {language === 'es' 
              ? 'Todos los derechos reservados.' 
              : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </>
  );
}