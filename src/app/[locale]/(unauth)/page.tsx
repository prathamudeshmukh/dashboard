import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Challenges } from '@/templates/Challenges';
import { CTA } from '@/templates/CTA';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { SecurityFeatures } from '@/templates/SecurityFeatures';
import { Testimonials } from '@/templates/Testimonials';
import { UseCase } from '@/templates/UseCase';
import { Working } from '@/templates/Working';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <Hero />
      <Challenges />
      <Working />
      <UseCase />
      <Testimonials />
      <SecurityFeatures />
      <CTA />
      <Footer />
    </>
  );
};

export default IndexPage;
