import CTACard from "@/components/pages/home/CTACard";
import { getTranslations } from "@/lib/i18n/server";

const CTASection = async () => {
  const t = await getTranslations("home.cta");

  return (
    <section className="py-16 md:py-24 bg-linear-180 from-brand-100 from-50% to-surface-deep to-50%">
      <div className="max-w-360 mx-auto px-8 md:px-12">
        <CTACard
          imageSrc="https://pub-4f074e0ebf814197a45996298c88925f.r2.dev/home-cta.webp"
          imageAlt={t("imageAlt")}
          title={t("title")}
          description={t("description")}
          buttonText={t("button")}
          buttonHref="/events"
        />
      </div>
    </section>
  );
};

CTASection.displayName = "CTASection";
export default CTASection;
