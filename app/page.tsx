import { Header } from '@/components/home/header';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedReleases } from '@/components/home/featured-releases';
import { AboutSection } from '@/components/home/about-section';
import { ContactSection } from '@/components/home/contact-section';
import { Footer } from '@/components/home/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedReleases />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
