import Button from "@/components/atoms/Button";
import { getTranslations } from "@/lib/i18n/server";

const CTASection: React.FC = async () => {
  const t = await getTranslations("home.cta");

  return (
    <section className="bg-surface-brand py-16 md:py-32">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row min-h-[550px] bg-surface-warm overflow-hidden">
          {/* 左側圖片 */}
          <div className="md:w-1/2 relative h-[350px] md:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop"
              alt={t("imageAlt")}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* 右側文字 */}
          <div className="md:w-1/2 flex flex-col justify-center items-center md:items-start p-12 md:p-24 text-center md:text-left">
            <h2 className="typo-display text-5xl md:text-7xl text-foreground mb-8 leading-tight lowercase">
              {t("title")}
            </h2>
            <p className="typo-body text-base md:text-lg text-muted mb-12 max-w-sm leading-relaxed font-light">
              {t("description")}
            </p>
            <Button
              theme="base"
              href="/journeys"
              className="text-xs tracking-[0.3em] uppercase border-foreground text-foreground hover:bg-foreground hover:text-surface-warm"
            >
              {t("button")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

CTASection.displayName = "CTASection";
export default CTASection;
