import HeroSection from "@/components/organisms/HeroSection";
import EventsSection from "@/components/organisms/EventsSection";
import PrivateGroupSection from "@/components/organisms/PrivateGroupSection";
import ContactSection from "@/components/organisms/ContactSection";
import type { CommonDictionary, HomeDictionary } from "@/lib/i18n";

interface HomeTemplateProps {
  common: CommonDictionary;
  home: HomeDictionary;
}

export default function HomeTemplate({ common, home }: HomeTemplateProps) {
  return (
    <main>
      <HeroSection common={common} dict={home.hero} />
      <EventsSection dict={home.events} />
      <PrivateGroupSection dict={home.privateGroup} />
      <ContactSection dict={home.contact} />
    </main>
  );
}
