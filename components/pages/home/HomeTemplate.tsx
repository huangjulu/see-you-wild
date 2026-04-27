import HeroSection from "@/components/pages/home/HeroSection";
import OpeningAnimation from "@/components/pages/home/OpeningAnimation";
import PhilosophySection from "@/components/pages/home/PhilosophySection";
import JourneysSection from "@/components/pages/home/JourneysSection";
import CTASection from "@/components/pages/home/CTASection";
import WhyChooseUsSection from "@/components/pages/home/WhyChooseUsSection";
import TestimonialsSection from "@/components/pages/home/TestimonialsSection";
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
