import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import SocialLinks from "@/components/molecules/SocialLinks";
import { INSTAGRAM_HANDLE } from "@/lib/constants";
import type { HomeDictionary } from "@/lib/i18n";

interface ContactSectionProps {
  dict: HomeDictionary["contact"];
}

export default function ContactSection({ dict }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 px-4 text-center"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Heading
          level="h2"
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold"
        >
          {dict.heading}
        </Heading>
        <Text muted className="text-lg">
          {dict.description}
        </Text>
        <Text className="text-accent font-serif text-xl">
          {INSTAGRAM_HANDLE}
        </Text>
        <SocialLinks className="justify-center" />
      </div>
    </section>
  );
}
