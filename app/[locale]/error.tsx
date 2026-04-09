"use client";

import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/client";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const LocaleError: React.FC<LocaleErrorProps> = (props) => {
  const t = useTranslations("common.error");

  useEffect(() => {
    if (props.error.name === "ChunkLoadError") {
      window.location.reload();
    }
  }, [props.error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <Heading level="h1" className="text-6xl font-bold mb-4">
        {t("heading")}
      </Heading>
      <Text muted className="text-xl mb-8">
        {t("message")}
      </Text>
      <button
        onClick={props.reset}
        className="typo-ui inline-block px-8 py-3 rounded-full text-sm tracking-widest uppercase border border-white/60 text-white hover:bg-white/10 hover:border-white transition-all duration-300"
      >
        {t("retry")}
      </button>
    </main>
  );
};

LocaleError.displayName = "LocaleError";
export default LocaleError;
