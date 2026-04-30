import CTASection from "@/components/pages/home/CTASection";
import HeroSection from "@/components/pages/home/HeroSection";
import JourneysSection from "@/components/pages/home/JourneysSection";
import OpeningAnimation from "@/components/pages/home/OpeningAnimation";
import PhilosophySection from "@/components/pages/home/PhilosophySection";
import TestimonialsSection from "@/components/pages/home/TestimonialsSection";
import WhyChooseUsSection from "@/components/pages/home/WhyChooseUsSection";
import CookiePopup from "@/components/ui/molecules/CookiePopup";

const HomeTemplate: React.FC = () => {
  return (
    <main>
      <OpeningAnimation />
      <HeroSection />
      <PhilosophySection />
      <JourneysSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <CTASection />
      <CookiePopup />
    </main>
  );
};

HomeTemplate.displayName = "HomeTemplate";
export default HomeTemplate;
