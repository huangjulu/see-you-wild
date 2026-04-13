import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Button from "@/components/atoms/Button";
import { getTranslations } from "@/lib/i18n/server";

async function NotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <Heading level="h1" className="text-6xl font-bold mb-4">
        {t("heading")}
      </Heading>
      <Text muted className="text-xl mb-8">
        {t("message")}
      </Text>
      <Button href="/" external={false} theme="ghost">
        {t("backHome")}
      </Button>
    </main>
  );
}

NotFound.displayName = "NotFound";
export default NotFound;
