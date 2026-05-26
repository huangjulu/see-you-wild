import SocialIcon from "@/components/ui/atoms/SocialIcon";
import { CONTACT_EMAIL, INSTAGRAM_URL, LINE_OA_URL } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n/server";

import LargeBrandText from "../molecules/LargeBrandText";

const Footer = async () => {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 py-12 px-8 md:px-16 text-center border-t border-on-surface-deep/10 relative z-0 bg-surface-deep overflow-clip">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-3">
          <p className="font-serif text-lg font-semibold text-on-surface-brand/70">
            See You Wild <span className="tracking-wider">西揪團</span>
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
          <SocialIcon
            platform="line"
            href={LINE_OA_URL}
            className="min-w-0 min-h-0 text-on-surface-brand/70 hover:text-on-surface-brand"
          />
        </div>
        <hr
          className="border-on-surface-deep/20 max-w-xs mx-auto"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-on-surface-brand/60 [&>a]:hover:text-on-surface-brand [&>a]:transition-colors [&>a]:duration-300">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href="/service-policy">{t("footer.servicePolicy")}</a>
        </div>
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
