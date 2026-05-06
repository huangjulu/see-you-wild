import SocialIcon from "@/components/ui/atoms/SocialIcon";
import { INSTAGRAM_URL } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n/server";

import LargeBrandText from "../molecules/LargeBrandText";

const Footer: React.FC = async () => {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 py-12 px-10 md:px-16 text-center border-t border-surface-deep-fg/10 relative z-0 bg-surface-deep overflow-clip">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-3">
          <p className="font-serif text-lg font-semibold text-on-surface-brand">
            {t("siteName")}
          </p>
          <span
            aria-hidden="true"
            className="text-on-surface-brand/40 font-light"
          >
            |
          </span>
          <SocialIcon
            platform="instagram"
            href={INSTAGRAM_URL}
            className="min-w-0 min-h-0 text-on-surface-brand/70 hover:text-on-surface-brand"
          />
        </div>
        <hr
          className="border-surface-deep-fg/20 max-w-xs mx-auto"
          aria-hidden="true"
        />
        <p className="text-sm text-on-surface-brand/50">
          &copy; {year} {t("siteName")}. {t("footer.rights")}
        </p>
      </div>
      <LargeBrandText />
    </footer>
  );
};

Footer.displayName = "Footer";
export default Footer;
