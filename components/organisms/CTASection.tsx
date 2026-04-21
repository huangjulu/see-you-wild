import CTACard from "@/components/molecules/CTACard";
import { getTranslations } from "@/lib/i18n/server";

const CTASection: React.FC = async () => {
  const t = await getTranslations("home.cta");

  return (
    <section className="py-16 md:py-24 bg-linear-180 from-primary-100 from-50% to-surface-deep to-50%">
      <div className="max-w-360 mx-auto px-8 md:px-12">
        <CTACard
          imageSrc="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop"
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
