import Image from "next/image";
import Heading from "@/components/ui/atoms/Heading";
import Text from "@/components/ui/atoms/Text";
import Button from "@/components/ui/atoms/Button";
import { getTranslations } from "@/lib/i18n/server";

async function NotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <Image
        src="/images/event-camping.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-neutral-950/60" aria-hidden="true" />

      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[8rem] md:text-[12rem] text-white/10 pointer-events-none select-none leading-none"
        aria-hidden="true"
      >
        {t("code")}
      </span>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <Heading level="h1" className="text-2xl md:text-3xl text-white">
          {t("title")}
        </Heading>
        <Text className="text-white/70 max-w-md">{t("message")}</Text>
        <div className="mt-4">
          <Button href="/" external={false} theme="ghost">
            {t("backHome")}
          </Button>
        </div>
      </div>
    </main>
  );
}

NotFound.displayName = "NotFound";
export default NotFound;
