import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Button from "@/components/atoms/Button";
import { PRIVATE_GROUP_CTA_URL } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n/server";

const PrivateGroupSection: React.FC = async () => {
  const t = await getTranslations("home.privateGroup");

  return (
    <section
      id="private-group"
      className="relative py-24 md:py-32 px-4 text-center overflow-hidden"
      aria-labelledby="private-group-heading"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-accent/5"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 rounded-full bg-accent/10"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <Heading
          level="h2"
          id="private-group-heading"
          className="text-3xl md:text-4xl font-bold"
        >
          {t("title")}
        </Heading>
        <Text className="text-xl font-serif text-accent">{t("subtitle")}</Text>
        <Text muted className="leading-relaxed max-w-lg mx-auto">
          {t("description")}
        </Text>
        <div className="pt-4">
          <Button theme="solid" href={PRIVATE_GROUP_CTA_URL}>
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

PrivateGroupSection.displayName = "PrivateGroupSection";
export default PrivateGroupSection;
