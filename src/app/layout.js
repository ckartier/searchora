import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <I18nProvider>
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
