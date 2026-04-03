import HeroSection from "@/components/organisms/HeroSection";
import OpeningAnimation from "@/components/organisms/OpeningAnimation";
import PhilosophySection from "@/components/organisms/PhilosophySection";
import JourneysSection from "@/components/organisms/JourneysSection";
import TestimonialsSection from "@/components/organisms/TestimonialsSection";
import EventsSection from "@/components/organisms/EventsSection";
import PrivateGroupSection from "@/components/organisms/PrivateGroupSection";
import ContactSection from "@/components/organisms/ContactSection";
import CookiePopup from "@/components/molecules/CookiePopup";

function HomeTemplate() {
  return (
    <main>
      <OpeningAnimation />
      <HeroSection />
      <PhilosophySection />
      <JourneysSection />
      <TestimonialsSection />
      <EventsSection />
      <PrivateGroupSection />
      <ContactSection />
      <CookiePopup />
    </main>
  );
}

HomeTemplate.displayName = "HomeTemplate";
export default HomeTemplate;
