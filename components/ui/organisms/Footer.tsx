import { getTranslations } from "@/lib/i18n/server";
import LargeBrandText from "../molecules/LargeBrandText";
import SocialIcon from "@/components/ui/atoms/SocialIcon";
import { INSTAGRAM_URL } from "@/lib/constants";

const Footer: React.FC = async () => {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 py-12 px-6 md:px-12 text-center border-t border-surface-deep-fg/10 relative z-0 bg-surface-deep overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-3">
          <p className="font-serif text-lg font-semibold text-surface-deep-fg">
            {t("siteName")}
          </p>
          <span
            aria-hidden="true"
            className="text-surface-deep-fg/40 font-light"
          >
            |
          </span>
          <SocialIcon
            platform="instagram"
            href={INSTAGRAM_URL}
            className="min-w-0 min-h-0 text-surface-deep-fg/70 hover:text-surface-deep-fg"
          />
        </div>
        <hr
          className="border-surface-deep-fg/20 max-w-xs mx-auto"
          aria-hidden="true"
        />
        <p className="text-sm text-surface-deep-fg/50">
          &copy; {year} {t("siteName")}. {t("footer.rights")}
        </p>
      </div>
      <LargeBrandText />
    </footer>
  );
};

Footer.displayName = "Footer";
export default Footer;
