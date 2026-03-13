import HeroSection from "@/components/organisms/HeroSection";
import EventsSection from "@/components/organisms/EventsSection";
import PrivateGroupSection from "@/components/organisms/PrivateGroupSection";
import ContactSection from "@/components/organisms/ContactSection";

export default function HomeTemplate() {
  return (
    <main>
      <HeroSection />
      <EventsSection />
      <PrivateGroupSection />
      <ContactSection />
    </main>
  );
}
