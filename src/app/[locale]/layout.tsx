import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { locales, type Locale } from '@/lib/i18n';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-noto-arabic',
  subsets: ['arabic'],
});

export const metadata: Metadata = {
  title: 'Dental Clinic Management',
  description: 'Dental Clinic Management SaaS Platform',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass =
    locale === 'ar'
      ? `${notoSansArabic.variable} font-[family-name:var(--font-noto-arabic)]`
      : `${inter.variable} font-[family-name:var(--font-inter)]`;

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${notoSansArabic.variable} h-full antialiased`}>
      <body className={`${fontClass} min-h-full flex flex-col`}>
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          {children}
          <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} dir={dir} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
