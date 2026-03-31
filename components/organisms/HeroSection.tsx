import Image from "next/image";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import ScrollIndicator from "@/components/atoms/ScrollIndicator";
import type { CommonDictionary, HomeDictionary } from "@/lib/i18n";

interface HeroSectionProps {
  common: CommonDictionary;
  dict: HomeDictionary["hero"];
}

export default function HeroSection({ common, dict }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4"
      aria-label="Hero"
    >
      <Image
        src="/images/hero.jpg"
        alt={dict.heroImageAlt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={80}
      />
      <div className="absolute inset-0 bg-background/50" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        {/* <Logo size="lg" className="drop-shadow-lg" /> */}
        <Heading
          level="h1"
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide"
        >
          {common.siteName}
        </Heading>
        <Text className="text-xl md:text-2xl tracking-[0.3em] font-serif text-white/90">
          {dict.tagline}
        </Text>
      </div>

      <div className="absolute bottom-8 z-10">
        <ScrollIndicator />
      </div>
    </section>
  );
}
