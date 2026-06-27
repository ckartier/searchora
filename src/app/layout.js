import './globals.css';
import { headers, cookies } from 'next/headers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/routing';

export const metadata = {
  title: 'Searchora — Make Your Brand Appear in AI Answers',
  description:
    'Searchora helps companies become the source used inside AI-generated responses from ChatGPT, Gemini, Copilot, and more. Audit your AI visibility today.',
  keywords: 'AI visibility, GEO, generative engine optimization, AI answers, brand visibility, AI search',
  openGraph: {
    title: 'Searchora — Make Your Brand Appear in AI Answers',
    description:
      'Searchora helps companies become visible inside AI-generated answers. Audit, optimize, and monitor your AI presence.',
    type: 'website',
    locale: 'en_US',
  },
};

async function resolveLocale() {
  // 1. Locale exposée par le middleware (dérivée de l'URL pour les pages publiques).
  const headerLocale = (await headers()).get('x-searchora-locale');
  if (headerLocale && LOCALES.includes(headerLocale)) return headerLocale;
  // 2. Sinon (ex. dashboard), préférence mémorisée via cookie.
  const cookieLocale = (await cookies()).get('searchora-lang')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;
  return DEFAULT_LOCALE;
}

export default async function RootLayout({ children }) {
  const locale = await resolveLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className="antialiased">
        <I18nProvider initialLang={locale}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
