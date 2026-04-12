import HeroSection from "@/components/organisms/HeroSection";
import OpeningAnimation from "@/components/organisms/OpeningAnimation";
import PhilosophySection from "@/components/organisms/PhilosophySection";
import JourneysSection from "@/components/organisms/JourneysSection";
import TestimonialsSection from "@/components/organisms/TestimonialsSection";
import PrivateGroupSection from "@/components/organisms/PrivateGroupSection";
import ContactSection from "@/components/organisms/ContactSection";
import CookiePopup from "@/components/molecules/CookiePopup";

const HomeTemplate: React.FC = () => {
  return (
    <main>
      <OpeningAnimation />
      <HeroSection />
      <PhilosophySection />
      <JourneysSection />
      <TestimonialsSection />
      <PrivateGroupSection />
      <ContactSection />
      <CookiePopup />
    </main>
  );
};

HomeTemplate.displayName = "HomeTemplate";
export default HomeTemplate;
