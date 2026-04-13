import { getTranslations } from "@/lib/i18n/server";
import LargeBrandText from "../molecules/LargeBrandText";

const Footer: React.FC = async () => {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 text-center border-t border-surface-deep-fg/10 relative bg-surface-deep">
      <div className="max-w-6xl mx-auto space-y-4">
        <p className="font-serif text-lg font-semibold text-surface-deep-fg">
          {t("siteName")}
        </p>
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
