"use client";

import { useEffect } from "react";

import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import Text from "@/components/ui/atoms/Text";
import { useTranslations } from "@/lib/i18n/client";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const LocaleError: React.FC<LocaleErrorProps> = (props) => {
  const t = useTranslations("common.error");

  useEffect(
    function onChunkLoadError() {
      if (props.error.name === "ChunkLoadError") {
        const hasReloaded = sessionStorage.getItem("chunk_reload_attempted");
        if (hasReloaded) {
          return;
        } else {
          sessionStorage.setItem("chunk_reload_attempted", "true");
          window.location.reload();
        }
      }
    },
    [props.error]
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <Heading.H1 className="text-6xl font-bold mb-4">
        {t("heading")}
      </Heading.H1>
      <Text muted className="text-xl mb-8">
        {t("message")}
      </Text>
      <Button theme="ghost" onClick={props.reset}>
        {t("retry")}
      </Button>
    </main>
  );
};

LocaleError.displayName = "LocaleError";
export default LocaleError;
